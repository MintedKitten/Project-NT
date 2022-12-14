import type {
  GetServerSideProps,
  GetServerSidePropsResult,
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
  TextField,
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
import {
  formatDateDDMMYY,
  parseInteger,
  StagesProgress,
} from "../../src/local";
import { fileicon } from "../../src/fileicon";
import { ChangeEvent, useEffect, useState } from "react";
import fileSize from "filesize";
import { uploadToServer } from "../../src/create/files";
import { useConfirmDialog } from "react-mui-confirm";
import { addFMidsToStage } from "../../src/create/stages";
import { deleteStageFile, editStageStatus } from "../../src/edit/stages";
import ProjectMenubar from "../../src/components/ProjectMenubar";
import {
  LocalizationProvider,
  MobileDatePicker,
  DesktopDatePicker,
} from "@mui/x-date-pickers";
import { ThaiAdapterDayjs } from "../../src/models/classDateAdapter";
import { isMobile } from "react-device-detect";
import { log } from "../../src/logger";
import { checkSession } from "../../src/server";

/**
 * Custom Style
 */
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

/**
 * Custom Style
 */
const StageStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    "& .StageStepIconRoot-completedIcon": {
      color: "#329c34",
      zIndex: 1,
      fontSize: 18,
    },
  })
);

/**
 * Custom Icon
 */
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
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const stages = preresultstage.map((res) => {
    return convBack(res);
  });

  const files = srfiles.map((sfile) => {
    return convFileToTable(sfile);
  });

  const [completeDate, setCompleteDate] = useState(
    stages[step].status === StagesProgress.OnGoing
      ? new Date()
      : stages[step].completeDate
  );

  useEffect(() => {
    const actstep = document.getElementById(
      `${stages[step]._id?.toHexString()}`
    );
    if (actstep) {
      actstep.scrollIntoView({ behavior: "smooth" });
    }
  }, [step, stages]);

  /**
   * Handle when changing display step
   * @param step
   */
  const handleChangeActiveStep = (step: number) => {
    pagereload(step);
  };

  /**
   * Reload the page to display step
   * @param step
   */
  const pagereload = (step: number) => {
    router.push({
      pathname: "/project/stages",
      query: { pid: pid, step: step },
    });
  };

  const openConfirmDialog = useConfirmDialog();
  /**
   * Handle when uploading file
   * @param e
   * @returns
   */
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
          const uploadRes = await uploadToServer(formData);
          fmids.push(uploadRes.fmid);
        }
        const stid = stages[step]._id?.toHexString() + "";
        const isAllSuccessful = await addFMidsToStage(pid, stid, fmids);
        if (isAllSuccessful) {
          pagereload(step);
        }
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

  /**
   * Handle when changing stage status
   * @param status
   * @param date
   */
  const changeStageStatus = async (status: StagesProgress, date: Date) => {
    const isUpdateSuccessful = await editStageStatus(
      stages[step]._id?.toHexString() + "",
      status,
      date
    );
    if (isUpdateSuccessful) {
      if (status === StagesProgress.Complete) {
        pagereload(step + 1 < stages.length ? step + 1 : stages.length - 1);
      } else {
        pagereload(step);
      }
    }
  };

  /**
   * The date and status element
   * @returns
   */
  const StatusElement = (
    <>
      {stages[step].status === StagesProgress.OnGoing ? (
        <>
          <Box>
            <Box sx={{ display: "flex" }}>
              <Box sx={{ flexGrow: 1 }} />
              <LocalizationProvider
                dateAdapter={ThaiAdapterDayjs}
                dateFormats={{
                  monthAndYear: "MMMM(MM) BBBB",
                  monthShort: "MMM(MM)",
                  year: "BBBB",
                }}
              >
                {isDisplayMobile ? (
                  <MobileDatePicker
                    value={completeDate}
                    views={["year", "month", "day"]}
                    onChange={(e: any | null) => {
                      if (e) {
                        setCompleteDate(new Date(e["$y"], e["$M"], e["$D"]));
                      }
                    }}
                    inputFormat="DD/MM/BBBB"
                    showDaysOutsideCurrentMonth
                    renderInput={(params) => (
                      <TextField size="small" {...params} disabled />
                    )}
                  />
                ) : (
                  <>
                    <TextField
                      sx={{
                        width: "72px",
                        marginTop: { xs: 1, lg: 0 },
                      }}
                      placeholder="00"
                      value={completeDate.getDate()}
                      size="small"
                      inputProps={{}}
                      label="?????????"
                      onChange={(e) => {
                        if (e.target.value) {
                          setCompleteDate(
                            new Date(
                              completeDate.getFullYear(),
                              completeDate.getMonth(),
                              parseInteger(e.target.value)
                            )
                          );
                        } else {
                          setCompleteDate(
                            new Date(
                              completeDate.getFullYear(),
                              completeDate.getMonth(),
                              1
                            )
                          );
                        }
                      }}
                      type="number"
                    />
                    <TextField
                      sx={{
                        width: "72px",
                        marginTop: { xs: 1, lg: 0 },
                      }}
                      placeholder="00"
                      value={completeDate.getMonth() + 1}
                      size="small"
                      label="???????????????"
                      onChange={(e) => {
                        if (e.target.value) {
                          setCompleteDate(
                            new Date(
                              completeDate.getFullYear(),
                              parseInteger(e.target.value) - 1,
                              completeDate.getDate()
                            )
                          );
                        } else {
                          setCompleteDate(
                            new Date(
                              completeDate.getFullYear(),
                              0,
                              completeDate.getDate()
                            )
                          );
                        }
                      }}
                      type="number"
                    />
                    <TextField
                      sx={{
                        width: "90px",
                        marginTop: { xs: 1, lg: 0 },
                      }}
                      placeholder="0000"
                      value={completeDate.getFullYear() + 543}
                      size="small"
                      label="??????"
                      onChange={(e) => {
                        if (e.target.value.length > 0) {
                          let t = e.target.value;
                          if (t.length > 4) {
                            t = t.slice(-4);
                          }
                          setCompleteDate(
                            new Date(
                              parseInteger(t) - 543,
                              completeDate.getMonth(),
                              completeDate.getDate()
                            )
                          );
                        } else {
                          setCompleteDate(
                            new Date(
                              -543,
                              completeDate.getMonth(),
                              completeDate.getDate()
                            )
                          );
                        }
                      }}
                      type="number"
                    />
                    <DesktopDatePicker
                      value={completeDate}
                      views={["year", "month", "day"]}
                      onChange={(e: any | null) => {
                        if (e) {
                          setCompleteDate(new Date(e["$y"], e["$M"], e["$D"]));
                        }
                      }}
                      inputFormat="DD/MM/BBBB"
                      showDaysOutsideCurrentMonth
                      renderInput={(params) => {
                        let pr = { ...params };
                        if (pr.inputProps) {
                          pr.inputProps.readOnly = true;
                        }
                        return (
                          <TextField
                            size="small"
                            sx={{
                              width: 150,
                              marginTop: { xs: 1, lg: 0 },
                              marginBottom: { xs: 1, lg: 0 },
                            }}
                            {...pr}
                            disabled
                          />
                        );
                      }}
                    />
                  </>
                )}
              </LocalizationProvider>
            </Box>
            <Box sx={{ display: "flex", mt: 1 }}>
              <Box sx={{ flexGrow: 1 }} />
              <Typography sx={{ mr: 1 }}>Stage status: </Typography>
              <Typography sx={{ color: "Red", mr: 1 }}>In Progress</Typography>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={() => {
                  changeStageStatus(StagesProgress.Complete, completeDate);
                }}
              >
                Mark as Complete
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ display: "flex" }}>
          <Box sx={{ flexGrow: 1 }} />
          <Typography sx={{ mr: 1 }}>Stage status:</Typography>
          <Typography sx={{ color: "Green", mr: 1 }}>
            Complete {formatDateDDMMYY(stages[step].completeDate)}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CancelIcon />}
            onClick={() => {
              changeStageStatus(StagesProgress.OnGoing, completeDate);
              setCompleteDate(new Date());
            }}
          >
            Mark as In Progress
          </Button>
        </Box>
      )}
    </>
  );

  /**
   * Authentication: Redirect if not authenticated
   */
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
          {isNavbar ? (
            <>
              <PageNavbar session={data} />
              <ProjectNavbar pid={pid} />
            </>
          ) : (
            <ProjectMenubar session={data} />
          )}
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
                          minHeight: "160px",
                        }}
                      >
                        <StepButton
                          onClick={() => {
                            handleChangeActiveStep(index);
                          }}
                        >
                          <StepLabel StepIconComponent={StageStepIcon}>
                            <Typography>{name}</Typography>
                            {stages[index].status ===
                            StagesProgress.Complete ? (
                              <Typography sx={{ fontWeight: "bold" }}>
                                {formatDateDDMMYY(stages[index].completeDate)}
                              </Typography>
                            ) : (
                              <></>
                            )}
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
              {`?????????????????????: (${step + 1})`}
            </Typography>
            <Typography variant={"h5"}>{stages[step].name}</Typography>
          </Box>
          <Box sx={{ display: { md: "flex" }, mt: 1, alignItems: "center" }}>
            <TitleButtonElement />
            <Box sx={{ flexGrow: 1 }} />
            {StatusElement}
          </Box>
          <Box component="div">
            <Box
              sx={{
                mt: 1,
                border: 1,
                paddingLeft: 1,
                paddingY: 1,
                borderColor: "lightgrey",
                borderRadius: 2,
                overflow: "auto",
              }}
            >
              <Grid container spacing={1} sx={{ minWidth: "600px" }}>
                <Grid
                  item
                  xs={6}
                  sx={{ borderBottom: 1, borderColor: "lightgrey" }}
                >
                  <Typography>Name</Typography>
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{ borderBottom: 1, borderColor: "lightgrey" }}
                >
                  <Typography>Size</Typography>
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{ borderBottom: 1, borderColor: "lightgrey" }}
                >
                  <Typography>Upload Date</Typography>
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{ borderBottom: 1, borderColor: "lightgrey" }}
                >
                  Action
                </Grid>
              </Grid>
              <Grid
                container
                spacing={1}
                rowSpacing={1}
                sx={{ mt: 0, maxHeight: "65vh", minWidth: "600px" }}
              >
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
                  files.map((file) => {
                    const { _id, filename, filetype, size, uploadDate } = file;
                    return (
                      <>
                        <Grid
                          item
                          xs={1}
                          sx={{
                            borderTop: 1,
                            borderColor: "lightgrey",
                          }}
                        >
                          <Typography>{fileicon(filetype)}</Typography>
                        </Grid>
                        <Grid
                          item
                          xs={5}
                          sx={{
                            borderTop: 1,
                            borderColor: "lightgrey",
                          }}
                        >
                          <Typography>{filename}</Typography>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          sx={{
                            borderTop: 1,
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
                            borderTop: 1,
                            borderColor: "lightgrey",
                          }}
                        >
                          <Typography>{formatDate(uploadDate)}</Typography>
                        </Grid>
                        <Grid
                          item
                          xs={1}
                          sx={{
                            borderTop: 1,
                            borderColor: "lightgrey",
                          }}
                        >
                          <a
                            // eslint-disable-next-line react/no-unknown-property
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
                            borderTop: 1,
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
                                    await deleteStageFile(
                                      `${_id?.toHexString()}`
                                    );
                                  if (isDeleteSuccessful) {
                                    pagereload(step);
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
  const session = await checkSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  const toLog = {
    msg: "Project stages page was queried",
    url: "project/stages",
    uid: session.id,
    user: session.user?.name,
    rawHeaders: context.req.rawHeaders,
    query: context.query,
  };
  log(JSON.stringify(toLog));
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/home/status",
        permanent: false,
      },
    };
  }
  let retOb: GetServerSidePropsResult<{
    pid: string;
    preresultstage: ReturnType<typeof convtoSerializable>[];
    step: number;
    srfiles: ReturnType<typeof convFileToSerializable>[];
  }> = {
    redirect: {
      destination: "/home/status",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const stages = await stagesFindAll(conn, {
      projId: new ObjectId(webquery["pid"]),
    });
    stages.sort((a, b) => {
      return a.order < b.order ? -1 : 1;
    });
    let activestep = 0;
    let isComplete = true;
    if (!webquery["step"]) {
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
      const step = parseInteger(webquery["step"]);
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
      const file = await getFileMetadata(conn, { _id: element.fileId });
      if (file) {
        files.push(convFileToSerializable(file));
      }
    }
    retOb = {
      props: {
        pid: webquery.pid as string,
        preresultstage: preresultstage,
        step: activestep,
        srfiles: files,
      },
    };
  } catch (err) {
    retOb = {
      redirect: {
        destination: "/home/status",
        permanent: false,
      },
    };
  } finally {
    await conn.close();
    return retOb;
  }
};

/**
 * Serializing data
 * @param data
 * @returns
 */
function convtoSerializable(data: stagesInt) {
  const { _id, projId, completeDate, ...r } = data;
  return {
    _id: _id?.toHexString(),
    projId: projId.toHexString(),
    completeDate: completeDate.toString(),
    ...r,
  };
}

/**
 * Convert serialized data back to usable data
 * @param data
 * @returns
 */
function convBack(data: ReturnType<typeof convtoSerializable>): stagesInt {
  const {
    _id: s_id,
    projId: sprojId,
    completeDate: scompleteDate,
    ...r
  } = data;
  return {
    _id: new ObjectId(s_id),
    projId: new ObjectId(sprojId),
    completeDate: new Date(scompleteDate),
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
