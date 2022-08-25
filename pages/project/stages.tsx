import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Step,
  StepButton,
  StepConnector,
  stepConnectorClasses,
  StepIcon,
  StepIconProps,
  StepLabel,
  Stepper,
  styled,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  fileMetadataInt,
  getMongoClient,
  stagesFindAll,
  stagesInt,
} from "../../src/db";
import Head from "next/head";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  Check,
} from "@mui/icons-material";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { ObjectId } from "bson";
import { getLength, StagesProgress } from "../../src/local";
import { ChangeEvent, useEffect, useState } from "react";
import fileSize from "filesize";
import { deleteFileFromProject, uploadToServer } from "../../src/create/files";
import { useConfirmDialog } from "react-mui-confirm";

const StageConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#784af4",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#329c34",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const StageStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    "& .StageStepIconRoot-completedIcon": {
      color: "#329c34",
      zIndex: 1,
      fontSize: 18,
    },
  })
);

function StageStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <StageStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="StageStepIcon-completedIcon" />
      ) : (
        <StepIcon {...props}/>
      )}
    </StageStepIconRoot>
  );
}

const ProjectStagesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresult, step }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  let stages = preresult.map((res) => {
    return convBack(res);
  });

  stages = stages.sort((a, b) => {
    return a.order < b.order ? -1 : 1;
  });

  const [activeStep, setActiveStep] = useState(() => {
    if (step === -1) {
      for (let index = 0; index < stages.length; index++) {
        const element = stages[index];
        if (element.status === StagesProgress.OnGoing) {
          return element.order;
        }
      }
      return stages.length - 1;
    } else {
      return step;
    }
  });

  const [files, setFiles] = useState<fileMetadataInt[]>([]);

  useEffect(() => {
    const actstep = document.getElementById(
      `${stages[activeStep]._id?.toHexString()}`
    );
    if (actstep) {
      actstep.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeStep, stages]);

  const handleChangeActiveStep = (step: number) => {
    setActiveStep(step);
    reloadthispage(step);
  };

  const reloadthispage = (tostep: number) => {
    router.push({
      pathname: "/project/stages",
      query: { pid: pid, step: tostep },
    });
  };

  // const totalSteps = () => {
  //   return stages.length;
  // };

  // const completedSteps = () => {
  //   return Object.keys(completed).length;
  // };

  // const isLastStep = () => {
  //   return activeStep === totalSteps() - 1;
  // };

  // const allStepsCompleted = () => {
  //   return completedSteps() === totalSteps();
  // };

  // const handleNext = () => {
  //   const newActiveStep =
  //     isLastStep() && !allStepsCompleted()
  //       ? // It's the last step, but not all stages have been completed,
  //         // find the first step that has been completed
  //         stages.findIndex((stage, i) => !(i in completed))
  //       : activeStep + 1;
  //   setActiveStep(newActiveStep);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

  // const handleStep = (step: number) => () => {
  //   setActiveStep(step);
  // };

  // const handleComplete = () => {
  //   const newCompleted = completed;
  //   newCompleted[activeStep] = true;
  //   setCompleted(newCompleted);
  //   handleNext();
  // };

  const openConfirmDialog = useConfirmDialog();

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files) {
      return;
    }
    const file = e.target.files;
    let filename = file[0].name;
    for (let index = 1; index < file.length; index++) {
      const element = file[index];
      filename += ", " + element.name;
    }
    openConfirmDialog({
      title: "Are you sure you want to upload file: " + filename,
      onConfirm: async () => {
        const fmids: string[] = [];
        for (let index = 0; index < file.length; index++) {
          const elm = file[index];
          const formData = new FormData();
          formData.append("file", elm);
          const uploadRes = await uploadToServer(formData, (ld, tl) => {
            // For upload progress bar
          });
          fmids.push(uploadRes.fmid);
          const stid = stages[activeStep]._id;
          console.log(stid?.toHexString());
        }
        // const isAllSuccessful = await addFMidsToProject(pid, fmids);
        // if (isAllSuccessful) {
        //   router.push({ pathname: "/project/files", query: { pid: pid } });
        // }
      },
      cancelButtonProps: {
        color: "primary",
      },
      confirmButtonProps: {
        color: "primary",
      },
      confirmButtonText: "Upload",
      rejectOnCancel: false,
    });
  }

  const TitleButtonElement = () => {
    return (
      <Button
        variant="contained"
        component="label"
        startIcon={<FileUploadIcon />}
      >
        Upload file
        <input
          type="file"
          hidden
          multiple
          onChange={(e) => {
            handleFileUpload(e);
          }}
        />
      </Button>
    );
  };

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Details</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={[
              { Header: "Search Project", Link: "/search/projects" },
              { Header: "Search Equipments", Link: "/search/equipments" },
              { Header: "Add New Project", Link: "/create/projects" },
            ]}
            currentTab={"Project"}
            session={data}
          />
          <ProjectNavbar
            navlink={[
              { Header: "Details", Link: "/project/projects" },
              { Header: "Files", Link: "/project/files" },
              { Header: "Equipments", Link: "/project/equipments" },
              { Header: "Stages", Link: "/project/stages" },
            ]}
            currentTab={"Stages"}
            pid={pid}
          />
        </PageAppbar>
        <Container maxWidth="xl">
          <Box
            sx={{
              my: { sm: 3 },
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={{ width: "100%", overflow: "auto" }}>
              <div style={{ width: stages.length * 300 + "px" }}>
                <Stepper
                  nonLinear
                  alternativeLabel
                  activeStep={activeStep}
                  connector={<StageConnector />}
                >
                  {stages.map((stage, index) => {
                    const { name, order, projId, status, _id } = stage;
                    return (
                      <Step
                        key={name}
                        completed={status === StagesProgress.Complete}
                        id={_id?.toHexString()}
                        sx={{
                          // minWidth: getLength(name) * 8,
                          minHeight: "120px",
                        }}
                      >
                        <StepButton
                          onClick={() => {
                            handleChangeActiveStep(index);
                          }}
                        >
                          <StepLabel StepIconComponent={StageStepIcon}>
                            {name}
                          </StepLabel>
                        </StepButton>
                      </Step>
                    );
                  })}
                </Stepper>
              </div>
            </div>
          </Box>
        </Container>
        <PageContainer>
          <Box sx={{ display: "flex" }}>
            <TitleButtonElement />
            {activeStep}
          </Box>
          <Box
            sx={{
              border: 1,
              paddingX: 1,
              paddingY: 1,
              borderColor: "lightgrey",
              borderRadius: 2,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            <Grid container spacing={1} rowSpacing={1}>
              <Grid item xs={6}>
                Name
              </Grid>
              <Grid item xs={2}>
                Size
              </Grid>
              <Grid item xs={2}>
                Upload Date
              </Grid>
              <Grid item xs={2}></Grid>
            </Grid>
          </Box>
          <Box
            sx={{
              paddingTop: 1,
              paddingLeft: 1,
              borderColor: "lightgrey",
            }}
          >
            <Grid container spacing={1} rowSpacing={1}>
              {files.length === 0 ? (
                <Typography
                  sx={{
                    fontFamily: "Roboto",
                    color: "lightgrey",
                    fontWeight: 300,
                    justifyContent: "flex-start",
                  }}
                >
                  No file was found.
                </Typography>
              ) : (
                files.map((file, index) => {
                  const { _id, filename, filetype, size, uploadDate, dir } =
                    file;
                  return (
                    <>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderLeft: 1,
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {filetype}
                      </Grid>
                      <Grid
                        item
                        xs={5}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {filename}
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {fileSize(size, { standard: "iec" })}
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        {formatDate(uploadDate)}
                      </Grid>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <a
                          download={filename}
                          href={`/files/${_id?.toHexString()}`}
                        >
                          <DownloadIcon sx={{ cursor: "pointer" }} />
                        </a>
                      </Grid>
                      <Grid
                        item
                        xs={1}
                        sx={{
                          borderRight: 1,
                          borderBottom: 1,
                          borderColor: "lightgrey",
                          alignItems: "center",
                        }}
                      >
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            openConfirmDialog({
                              title: "Remove file: " + filename + "?",
                              onConfirm: async () => {
                                const isDeleteSuccessful =
                                  await deleteFileFromProject(
                                    `${_id?.toHexString()}`
                                  );
                                if (isDeleteSuccessful) {
                                  router.push({
                                    pathname: "/project/files",
                                    query: { pid: pid },
                                  });
                                }
                              },
                              cancelButtonProps: {
                                color: "primary",
                              },
                              confirmButtonProps: {
                                color: "warning",
                              },
                              confirmButtonText: "Delete",
                            });
                          }}
                        >
                          <DeleteIcon
                            sx={{ cursor: "pointer", color: "red" }}
                          />
                        </div>
                      </Grid>
                    </>
                  );
                })
              )}
            </Grid>
          </Box>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={status === "loading"}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ProjectStagesPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  preresult: ReturnType<typeof convtoSerializable>[];
  step: number;
}> = async (context) => {
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/project/",
        permanent: false,
      },
    };
  }
  let activestep = -1;
  if (webquery["step"]) {
    activestep = parseInt(webquery["step"]);
  }
  const conn = await getMongoClient();
  const stages = await stagesFindAll(conn, {
    projId: new ObjectId(webquery["pid"]),
  });
  const preresult = stages.map((stage) => {
    return convtoSerializable(stage);
  });
  conn.close();
  return {
    props: {
      pid: webquery.pid as string,
      preresult: preresult,
      step: activestep,
    },
  };
};

function convtoSerializable(data: stagesInt) {
  const { _id, projId, ...r } = data;
  return {
    _id: _id?.toHexString(),
    projId: projId.toHexString(),
    ...r,
  };
}

function convBack(data: ReturnType<typeof convtoSerializable>): stagesInt {
  const { _id: s_id, projId: sprojId, ...r } = data;
  return {
    _id: new ObjectId(s_id),
    projId: new ObjectId(sprojId),
    ...r,
  };
}

function formatDate(uploadDate: Date) {
  return `${(uploadDate.getDate() + "").padStart(2, "0")}/${(
    uploadDate.getMonth() +
    1 +
    ""
  ).padStart(2, "0")}/${uploadDate.getFullYear()} ${(
    uploadDate.getHours() + ""
  ).padStart(2, "0")}:${(uploadDate.getMinutes() + "").padStart(2, "0")}:${(
    uploadDate.getSeconds() + ""
  ).padStart(2, "0")}`;
}
