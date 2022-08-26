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
  useMediaQuery,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  fileMetadataInt,
  getFileMetadata,
  getMongoClient,
  stageFilesFindAll,
  stagesFindAll,
  stagesInt,
} from "../../src/db";
import Head from "next/head";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { ObjectId } from "bson";
import { navInfo, projectNavInfo, StagesProgress } from "../../src/local";
import { ChangeEvent, useEffect } from "react";
import fileSize from "filesize";
import { uploadToServer } from "../../src/create/files";
import { useConfirmDialog } from "react-mui-confirm";
import { addFMidsToStage } from "../../src/create/stages";
import { editStageStatus } from "../../src/edit/stages";
import { getToken } from "next-auth/jwt";

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
        <CheckIcon className="StageStepIcon-completedIcon" />
      ) : (
        <StepIcon {...props} />
      )}
    </StageStepIconRoot>
  );
}

const ProjectStagesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresultstage, step, srfiles }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  let stages = preresultstage.map((res) => {
    return convBack(res);
  });

  const files = srfiles.map((sfile) => {
    return convFileToTable(sfile);
  });

  useEffect(() => {
    const actstep = document.getElementById(
      `${stages[step]._id?.toHexString()}`
    );
    if (actstep) {
      actstep.scrollIntoView({ behavior: "smooth" });
    }
  }, [step, stages]);

  const handleChangeActiveStep = (step: number) => {
    pagereload(step);
  };

  const pagereload = (step: number) => {
    router.push({
      pathname: "/project/stages",
      query: { pid: pid, step: step },
    });
  };

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
        }
        const stid = stages[step]._id?.toHexString() + "";
        const isAllSuccessful = await addFMidsToStage(pid, stid, fmids);
        if (isAllSuccessful) {
          pagereload(step);
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

  const changeStageStatus = async (status: StagesProgress) => {
    const isUpdateSuccessful = await editStageStatus(
      stages[step]._id?.toHexString() + "",
      status
    );
    if (isUpdateSuccessful) {
      pagereload(step);
    }
  };

  const StatusElement = () => {
    if (stages[step].status === StagesProgress.OnGoing) {
      return (
        <>
          <Typography sx={{ mr: 1 }}>Stage status: </Typography>
          <Typography sx={{ color: "Red", mr: 1 }}>On Going</Typography>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => {
              changeStageStatus(StagesProgress.Complete);
            }}
          >
            Mark as Complete
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Typography sx={{ mr: 1 }}>Stage status:</Typography>
          <Typography sx={{ color: "Green", mr: 1 }}>Complete</Typography>
          <Button
            variant="contained"
            startIcon={<CancelIcon />}
            onClick={() => {
              changeStageStatus(StagesProgress.OnGoing);
            }}
          >
            Mark as On Going
          </Button>
        </>
      );
    }
  };

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Stages</title>
        </Head>
        <PageAppbar>
          <PageNavbar navlink={navInfo} currentTab={3} session={data} />
          <ProjectNavbar
            navlink={projectNavInfo}
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
              <div style={{ width: stages.length * 280 + "px" }}>
                <Stepper
                  nonLinear
                  alternativeLabel
                  activeStep={step}
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
            <Typography
              variant={"h5"}
              sx={{ fontWeight: "bold", mr: 1, minWidth: "134px" }}
            >
              {`ขั้นตอน: (${step + 1})`}
            </Typography>
            <Typography variant={"h5"}>{stages[step].name}</Typography>
          </Box>
          <Box sx={{ display: "flex", mt: 1, alignItems: "center" }}>
            <TitleButtonElement />
            <Box sx={{ flexGrow: 1 }} />
            <StatusElement />
          </Box>
          <Box
            sx={{
              mt: 1,
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
                <Typography>Name</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>Size</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>Upload Date</Typography>
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
                        <Typography>{filename}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>
                          {fileSize(size, { standard: "iec" })}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={2}
                        sx={{
                          borderBottom: 1,
                          borderColor: "lightgrey",
                        }}
                      >
                        <Typography>{formatDate(uploadDate)}</Typography>
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
                                // const isDeleteSuccessful =
                                //   await deleteFileFromProject(
                                //     `${_id?.toHexString()}`
                                //   );
                                // if (isDeleteSuccessful) {
                                //   router.push({
                                //     pathname: "/project/files",
                                //     query: { pid: pid },
                                //   });
                                // }
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
  preresultstage: ReturnType<typeof convtoSerializable>[];
  step: number;
  srfiles: ReturnType<typeof convFileToSerializable>[];
}> = async (context) => {
  const token = await getToken({
    req: context.req,
    secret: `${process.env.secret}`,
  });
  if (!token) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/project/",
        permanent: false,
      },
    };
  }

  const conn = await getMongoClient();
  const stages = await stagesFindAll(conn, {
    projId: new ObjectId(webquery["pid"]),
  });

  stages.sort((a, b) => {
    return a.order < b.order ? -1 : 1;
  });

  let activestep = 0;

  if (!webquery["step"]) {
    let isComplete = true;
    activestep = parseInt(webquery["step"]);
    for (let index = 0; index < stages.length; index++) {
      const element = stages[index];
      if (element.status === StagesProgress.OnGoing) {
        activestep = element.order;
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      activestep = stages.length - 1;
    }
  } else {
    const step = parseInt(webquery["step"]);
    if (step > 0 && step < stages.length) {
      activestep = step;
    }
  }

  const preresultstage = stages.map((stage) => {
    return convtoSerializable(stage);
  });
  const filesresult = await stageFilesFindAll(conn, {
    stageId: stages[activestep]._id,
  });
  const files: ReturnType<typeof convFileToSerializable>[] = [];
  for (let index = 0; index < filesresult.length; index++) {
    const element = filesresult[index];
    const file = await getFileMetadata({ _id: element.fileId });
    if (file) {
      files.push(convFileToSerializable(file));
    }
  }
  await conn.close();
  return {
    props: {
      pid: webquery.pid as string,
      preresultstage: preresultstage,
      step: activestep,
      srfiles: files,
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

function convFileToSerializable(data: fileMetadataInt) {
  const { _id, uploadDate, ...r } = data;
  return {
    _id: _id?.toHexString(),
    uploadDate: uploadDate.toString(),
    ...r,
  };
}

function convFileToTable(
  data: ReturnType<typeof convFileToSerializable>
): fileMetadataInt {
  const { _id: s_id, uploadDate: suploadDate, ...r } = data;
  return {
    _id: new ObjectId(s_id),
    uploadDate: new Date(suploadDate),
    ...r,
  };
}
