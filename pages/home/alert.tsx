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
import { useState } from "react";
import { Detector } from "react-detect-offline";
import AlertNavbar from "../../src/components/AlertNavbar";

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
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

const AlertPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  presult,
}) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const result = presult.map((res) => {
    return compileBackStatus(res);
  });

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

  const groupbyMMYY: { [key: string]: ReturnType<typeof compileBackStatus>[] } =
    {};
  result.forEach((res) => {
    const date = dayjs(res[keyDate]).format("01/MM/YYYY");
    if (!groupbyMMYY[date]) {
      groupbyMMYY[date] = [];
    }
    groupbyMMYY[date].push(res);
  });

  const handleChange = (
    event: React.SyntheticEvent,
    newValue: "contractendDate" | "maendDate"
  ) => {
    setKeyDate(newValue);
    setKeyAlert(newValue ? "contractAlertLevel" : "maAlertLevel");
  };

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
          <AlertNavbar keyDate={keyDate} handleChange={handleChange} />
        </PageAppbar>
        <Detector
          render={({ online }) => {
            if (!online) {
              return (
                <Snackbar open={true}>
                  <Alert severity="error" sx={{ width: "100%" }}>
                    No Internet Connection
                  </Alert>
                </Snackbar>
              );
            } else {
              return <></>;
            }
          }}
        />
        <PageContainer maxWidth="md">
          <Box sx={{ mt: 1 }}>
            {Object.entries(groupbyMMYY).map(([key, resarray]) => {
              return (
                <AlertAccordion key={key} expanded={true}>
                  <AlertAccordionSummary id={key}>
                    <Typography>{`${formatDateYYYYMM(
                      new Date(key)
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
                              bgcolor: getBGColorFromStatus(row[keyAlert]),
                              paddingY: 3,
                              paddingX: 1,
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
  if (mths > 3) {
    return isComplete ? DateDeadlineStatus.Complete : DateDeadlineStatus.Normal;
  } else if (mths >= 0) {
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
      return "";
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
