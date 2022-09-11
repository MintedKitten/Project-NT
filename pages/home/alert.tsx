import type {
  GetStaticProps,
  GetStaticPropsResult,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  AccordionSummaryProps,
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  Snackbar,
  styled,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import {
  alertNavType,
  DateDeadlineStatus,
  formatDateDDMMYY,
  formatDateYYYYMM,
} from "../../src/local";
import { getMongoClient, projectsInt, stagesInt } from "../../src/db";
import { ProjectWithInProgressStage } from "../../src/server";
import { ObjectId } from "bson";
import PageMenubar from "../../src/components/PageMenubar";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Detector } from "react-detect-offline";
import AlertNavbar from "../../src/components/AlertNavbar";
import { DataGrid } from "@mui/x-data-grid";

const AlertAccordion = styled((props: AccordionProps) => (
  <Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  marginBottom: "10px",
  border: `1px solid ${theme.palette.divider}`,
}));

const AlertAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary {...props} />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(0),
  },
  pointerEvents: "inherit",
}));

const AlertAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
  "& .MuiBox-root": {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginTop: theme.spacing(0.2),
  },
}));

const AlertPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  presult,
}) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;
  const containerAlertRef = useRef(null);
  const containerAllRef = useRef(null);

  const result = presult.map((res) => {
    return compileBackStatus(res);
  });

  const [tab, setTab] = useState<alertNavType>("All");

  const [keyDate, setKeyDate] = useState<"contractendDate" | "maendDate">(
    "contractendDate"
  );

  const [keyAlert, setKeyAlert] = useState<
    "contractAlertLevel" | "maAlertLevel"
  >("contractAlertLevel");

  const sortRes = () => {
    result.sort((a, b) => b[keyDate].getTime() - a[keyDate].getTime());
  };

  sortRes();
  // const today = dayjs(new Date());

  // const groupbyMMYYAlertFuture: {
  //   [key: string]: ReturnType<typeof compileBackStatus>[];
  // } = {};
  // const groupbyMMYYAlertPast: {
  //   [key: string]: ReturnType<typeof compileBackStatus>[];
  // } = {};
  // const groupbyMMYYFuture: {
  //   [key: string]: ReturnType<typeof compileBackStatus>[];
  // } = {};
  // const groupbyMMYYPast: {
  //   [key: string]: ReturnType<typeof compileBackStatus>[];
  // } = {};
  // result.forEach((res) => {
  //   const date = dayjs(res[keyDate]).format("01/MM/YYYY");
  //   const diff = -today.diff(res[keyDate], "days");
  //   if (diff >= 0) {
  //     if (!groupbyMMYYFuture[date]) {
  //       groupbyMMYYFuture[date] = [];
  //     }
  //     groupbyMMYYFuture[date].push(res);
  //     if (
  //       res[keyAlert] === DateDeadlineStatus.RedAlert ||
  //       res[keyAlert] === DateDeadlineStatus.PastDue
  //     ) {
  //       if (!groupbyMMYYAlertFuture[date]) {
  //         groupbyMMYYAlertFuture[date] = [];
  //       }
  //       groupbyMMYYAlertFuture[date].push(res);
  //     }
  //   } else {
  //     if (!groupbyMMYYPast[date]) {
  //       groupbyMMYYPast[date] = [];
  //     }
  //     if (
  //       res[keyAlert] === DateDeadlineStatus.RedAlert ||
  //       res[keyAlert] === DateDeadlineStatus.PastDue
  //     ) {
  //       groupbyMMYYPast[date].push(res);
  //       if (!groupbyMMYYAlertPast[date]) {
  //         groupbyMMYYAlertPast[date] = [];
  //       }
  //       groupbyMMYYAlertPast[date].push(res);
  //     }
  //   }
  // });

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: alertNavType
  ) => {
    setTab(newValue);
    // setKeyDate(newValue);
    // setKeyAlert(
    //   newValue === "contractendDate" ? "contractAlertLevel" : "maAlertLevel"
    // );
  };

  useEffect(() => {
    const alert_today = document.getElementById("alert_today");
    if (alert_today) {
      alert_today.scrollIntoView({ behavior: "smooth" });
    }
    const status_today = document.getElementById("status_today");
    if (status_today) {
      status_today.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Home Page</title>
        </Head>
        <PageAppbar>
          {isNavbar ? (
            <PageNavbar session={data} />
          ) : (
            <PageMenubar session={data} />
          )}
          <AlertNavbar tab={tab} handleChange={handleChange} />
        </PageAppbar>

        <PageContainer maxWidth="xl">{/* <DataGrid /> */}</PageContainer>
        {/* <Grid container spacing={1}>
            <Grid item xs={12} md={6} ref={containerAlertRef}>
              <Box sx={{ display: "flex", my: 1 }}>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="h3">Alert</Typography>
                <Box sx={{ flexGrow: 1 }} />
              </Box>
              <Grid container sx={{ maxHeight: "60vh", overflow: "auto" }}>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(groupbyMMYYAlertFuture).map(
                      ([key, resarray]) => {
                        const [dd, mm, yy] = key.split("/").map((r) => {
                          return Number(r);
                        });
                        return (
                          <AlertAccordion key={key} expanded={true}>
                            <AlertAccordionSummary id={key}>
                              <Typography>{`${formatDateYYYYMM(
                                new Date(yy, mm, dd)
                              )}`}</Typography>
                            </AlertAccordionSummary>
                            <AlertAccordionDetails>
                              {resarray.map((row) => {
                                const { project } = row;
                                return (
                                  <Link
                                    key={project._id}
                                    href={{
                                      pathname: "/project/projects",
                                      query: { pid: project._id },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        cursor: "pointer",
                                        border: 1,
                                        borderColor: "whitesmoke",
                                        borderRadius: 2,
                                        bgcolor: getBGColorFromStatus(
                                          row[keyAlert]
                                        ),
                                        paddingY: 3,
                                        paddingX: 1,
                                        ":hover": {
                                          boxShadow:
                                            "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                                          border: 1,
                                          borderColor: "#B7B3C7",
                                        },
                                      }}
                                    >
                                      <Typography>{`${project.projName}`}</Typography>
                                      <Box sx={{ flexGrow: 1 }} />
                                      <Typography>{`${formatDateDDMMYY(
                                        row[keyDate]
                                      )}`}</Typography>
                                    </Box>
                                  </Link>
                                );
                              })}
                            </AlertAccordionDetails>
                          </AlertAccordion>
                        );
                      }
                    )}
                  </Box>
                  {Object.keys(groupbyMMYYAlertFuture).length > 0 ||
                  Object.keys(groupbyMMYYAlertPast).length > 0 ? (
                    <Box
                      id="alert_today"
                      sx={{
                        display: "flex",
                        // border: 1,
                        // borderRadius: 5,
                        justifyItems: "center",
                        alignItems: "center",
                        // borderColor: "rgba(0, 0, 0, 0.25)",
                        my: 6,
                        // bgcolor: "whitesmoke",
                      }}
                    >
                      <Box
                        sx={{
                          flexGrow: 1,
                          mx: 1,
                          border: 1,
                          borderColor: "rgba(0, 0, 0, 0.25)",
                        }}
                      />
                      <Typography>
                        Today: {formatDateDDMMYY(today.toDate())}
                      </Typography>
                      <Box
                        sx={{
                          flexGrow: 1,
                          mx: 1,
                          border: 1,
                          borderColor: "rgba(0, 0, 0, 0.25)",
                        }}
                      />
                    </Box>
                  ) : (
                    <></>
                  )}
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(groupbyMMYYAlertPast).map(
                      ([key, resarray]) => {
                        const [dd, mm, yy] = key.split("/").map((r) => {
                          return Number(r);
                        });
                        return (
                          <AlertAccordion key={key} expanded={true}>
                            <AlertAccordionSummary id={key}>
                              <Typography>{`${formatDateYYYYMM(
                                new Date(yy, mm, dd)
                              )}`}</Typography>
                            </AlertAccordionSummary>
                            <AlertAccordionDetails>
                              {resarray.map((row) => {
                                const { project } = row;
                                return (
                                  <Link
                                    key={project._id}
                                    href={{
                                      pathname: "/project/projects",
                                      query: { pid: project._id },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        cursor: "pointer",
                                        border: 1,
                                        borderColor: "whitesmoke",
                                        borderRadius: 2,
                                        bgcolor: getBGColorFromStatus(
                                          row[keyAlert]
                                        ),
                                        paddingY: 3,
                                        paddingX: 1,
                                        ":hover": {
                                          boxShadow:
                                            "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                                          border: 1,
                                          borderColor: "#B7B3C7",
                                        },
                                      }}
                                    >
                                      <Typography>{`${project.projName}`}</Typography>
                                      <Box sx={{ flexGrow: 1 }} />
                                      <Typography>{`${formatDateDDMMYY(
                                        row[keyDate]
                                      )}`}</Typography>
                                    </Box>
                                  </Link>
                                );
                              })}
                            </AlertAccordionDetails>
                          </AlertAccordion>
                        );
                      }
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6} ref={containerAllRef}>
              <Box sx={{ display: "flex", my: 1 }}>
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="h3">All Status</Typography>
                <Box sx={{ flexGrow: 1 }} />
              </Box>
              <Grid container sx={{ maxHeight: "75vh", overflow: "auto" }}>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    {Object.entries(groupbyMMYYFuture).map(
                      ([key, resarray]) => {
                        const [dd, mm, yy] = key.split("/").map((r) => {
                          return Number(r);
                        });
                        return (
                          <AlertAccordion key={key} expanded={true}>
                            <AlertAccordionSummary id={key}>
                              <Typography>{`${formatDateYYYYMM(
                                new Date(yy, mm, dd)
                              )}`}</Typography>
                            </AlertAccordionSummary>
                            <AlertAccordionDetails>
                              {resarray.map((row) => {
                                const { project } = row;
                                return (
                                  <Link
                                    key={project._id}
                                    href={{
                                      pathname: "/project/projects",
                                      query: { pid: project._id },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        cursor: "pointer",
                                        border: 1,
                                        borderColor: "whitesmoke",
                                        borderRadius: 2,
                                        bgcolor: getBGColorFromStatus(
                                          row[keyAlert]
                                        ),
                                        paddingY: 3,
                                        paddingX: 1,
                                        ":hover": {
                                          boxShadow:
                                            "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                                          border: 1,
                                          borderColor: "#B7B3C7",
                                        },
                                      }}
                                    >
                                      <Typography>{`${project.projName}`}</Typography>
                                      <Box sx={{ flexGrow: 1 }} />
                                      <Typography>{`${formatDateDDMMYY(
                                        row[keyDate]
                                      )}`}</Typography>
                                    </Box>
                                  </Link>
                                );
                              })}
                            </AlertAccordionDetails>
                          </AlertAccordion>
                        );
                      }
                    )}
                  </Box>
                  {Object.keys(groupbyMMYYFuture).length > 0 ||
                  Object.keys(groupbyMMYYPast).length > 0 ? (
                    <Box
                      id="status_today"
                      sx={{
                        display: "flex",
                        // border: 1,
                        // borderRadius: 5,
                        justifyItems: "center",
                        alignItems: "center",
                        // borderColor: "rgba(0, 0, 0, 0.25)",
                        my: 6,
                        // bgcolor: "whitesmoke",
                      }}
                    >
                      <Box
                        sx={{
                          flexGrow: 1,
                          mx: 1,
                          border: 1,
                          borderColor: "rgba(0, 0, 0, 0.25)",
                        }}
                      />
                      <Typography>
                        Today: {formatDateDDMMYY(today.toDate())}
                      </Typography>
                      <Box
                        sx={{
                          flexGrow: 1,
                          mx: 1,
                          border: 1,
                          borderColor: "rgba(0, 0, 0, 0.25)",
                        }}
                      />
                    </Box>
                  ) : (
                    <></>
                  )}

                  <Box sx={{ mt: 1 }}>
                    {Object.entries(groupbyMMYYPast).map(([key, resarray]) => {
                      const [dd, mm, yy] = key.split("/").map((r) => {
                        return Number(r);
                      });
                      return (
                        <AlertAccordion key={key} expanded={true}>
                          <AlertAccordionSummary id={key}>
                            <Typography>{`${formatDateYYYYMM(
                              new Date(yy, mm, dd)
                            )}`}</Typography>
                          </AlertAccordionSummary>
                          <AlertAccordionDetails>
                            {resarray.map((row) => {
                              const { project } = row;
                              return (
                                <Link
                                  key={project._id}
                                  href={{
                                    pathname: "/project/projects",
                                    query: { pid: project._id },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      cursor: "pointer",
                                      border: 1,
                                      borderColor: "whitesmoke",
                                      borderRadius: 2,
                                      bgcolor: getBGColorFromStatus(
                                        row[keyAlert]
                                      ),
                                      paddingY: 3,
                                      paddingX: 1,
                                      ":hover": {
                                        boxShadow:
                                          "inset 0 0 100px 100px rgba(255, 255, 255, 0.2)",
                                        border: 1,
                                        borderColor: "#B7B3C7",
                                      },
                                    }}
                                  >
                                    <Typography>{`${project.projName}`}</Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Typography>{`${formatDateDDMMYY(
                                      row[keyDate]
                                    )}`}</Typography>
                                  </Box>
                                </Link>
                              );
                            })}
                          </AlertAccordionDetails>
                        </AlertAccordion>
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid> */}
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

export default AlertPage;

let _today = dayjs(new Date());
export const getStaticProps: GetStaticProps<{
  presult: ReturnType<typeof compileStatus>[];
}> = async () => {
  let retOb: GetStaticPropsResult<{
    presult: ReturnType<typeof compileStatus>[];
  }> = {
    props: { presult: [] },
  };
  _today = dayjs(new Date());
  const conn = await getMongoClient();
  try {
    const cres = await ProjectWithInProgressStage(conn, {});
    if (cres) {
      const arresult = await cres.toArray();
      const result = arresult.map((result) => {
        return compileStatus(result);
      });
      retOb = { props: { presult: result }, revalidate: 1 };
    }
  } catch (err) {
    alert(err);
  }
  await conn.close();
  return retOb;
};

function calAlertLevel(date: Date, isComplete: boolean): DateDeadlineStatus {
  const mths = -_today.diff(dayjs(date), "months");
  const days = -_today.diff(dayjs(date), "days");
  if (mths > 3) {
    return isComplete ? DateDeadlineStatus.Complete : DateDeadlineStatus.Normal;
  } else if (mths >= 0 && days > 0) {
    return isComplete
      ? DateDeadlineStatus.Complete
      : DateDeadlineStatus.RedAlert;
  } else {
    return isComplete ? DateDeadlineStatus.Passed : DateDeadlineStatus.PastDue;
  }
}

function compileStatus(
  result: projectsInt & {
    stages_docs: stagesInt[];
  }
): {
  project: ReturnType<typeof convtoSerializable>;
  isComplete: boolean;
  contractendDate: string;
  contractAlertLevel: ReturnType<typeof calAlertLevel>;
  maendDate: string;
  maAlertLevel: ReturnType<typeof calAlertLevel>;
} {
  const { stages_docs, ...dresult } = result;
  const presult = dresult as projectsInt;
  const isComplete = stages_docs.length === 0;
  return {
    project: convtoSerializable(presult),
    isComplete: isComplete,
    contractendDate: presult.contractendDate.toString(),
    contractAlertLevel: calAlertLevel(presult.contractendDate, isComplete),
    maendDate: presult.maendDate.toString(),
    maAlertLevel: calAlertLevel(presult.maendDate, false),
  };
}

function compileBackStatus(data: ReturnType<typeof compileStatus>): {
  project: ReturnType<typeof convtoSerializable>;
  isComplete: boolean;
  contractendDate: Date;
  contractAlertLevel: ReturnType<typeof calAlertLevel>;
  maendDate: Date;
  maAlertLevel: ReturnType<typeof calAlertLevel>;
} {
  const {
    contractendDate: scontractendDate,
    maendDate: smaendDate,
    ...r
  } = data;
  return {
    contractendDate: new Date(scontractendDate),
    maendDate: new Date(smaendDate),
    ...r,
  };
}

function convtoSerializable(
  data: Omit<projectsInt, "createdby" | "lastupdate">
) {
  const {
    _id,
    budget,
    contractstartDate,
    contractendDate,
    mastartDate,
    maendDate,
    ...r
  } = data;
  return {
    _id: (_id as ObjectId).toHexString(),
    contractstartDate: contractstartDate.toString(),
    contractendDate: contractendDate.toString(),
    mastartDate: mastartDate.toString(),
    maendDate: maendDate.toString(),
    budget: budget.toString(),
    ...r,
  };
}

function getBGColorFromStatus(status: DateDeadlineStatus) {
  switch (status) {
    case DateDeadlineStatus.Normal:
      return "#F9F9F9";
    case DateDeadlineStatus.Passed:
      return "#B7C4CF";
    case DateDeadlineStatus.PastDue:
      return "#FF1E00";
    case DateDeadlineStatus.RedAlert:
      return "#EC7272";
    case DateDeadlineStatus.Complete:
      return "#59CE8F";
  }
}
