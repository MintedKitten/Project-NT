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
  Backdrop,
  Box,
  CircularProgress,
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
import { DateDeadlineStatus, formatDateDMY } from "../../src/local";
import { getMongoClient, projectsInt, stagesInt } from "../../src/db";
import { ProjectWithInProgressStage } from "../../src/server";
import { ObjectId } from "bson";
import PageMenubar from "../../src/components/PageMenubar";
import dayjs from "dayjs";
import Link from "next/link";

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
  pointerEvents: "none",
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

  const sortByContract = () => {
    result.sort(
      (a, b) => b.contractendDate.getTime() - a.contractendDate.getTime()
    );
  };

  const sortByMA = () => {
    result.sort((a, b) => b.maendDate.getTime() - a.maendDate.getTime());
  };

  sortByContract();

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
        </PageAppbar>
        <PageContainer>
          {/* <Accordion TransitionProps={{ unmountOnExit: true }}></Accordion> */}
          {/* <Typography></Typography> */}
          {result.map((row, index) => {
            const {
              project,
              isComplete,
              contractAlertLevel,
              maAlertLevel,
              contractendDate,
              maendDate,
            } = row;
            const thedate = dayjs(contractendDate);
            let bgcolor = "";
            switch (contractAlertLevel) {
              case DateDeadlineStatus.Normal:
                bgcolor = "";
                break;
              case DateDeadlineStatus.Passed:
                bgcolor = "#B7C4CF";
                break;
              case DateDeadlineStatus.PastDue:
                bgcolor = "#66BFBF";
                break;
              case DateDeadlineStatus.RedAlert:
                bgcolor = "#FF4A4A";
                break;
              case DateDeadlineStatus.YellowAlert:
                bgcolor = "#FFAE6D";
                break;
            }
            return (
              // <Box key={index} sx={{ border: 1 }}>
              //   <Typography>{`${
              //     project.projName
              //   } - ${isComplete} | ${contractendDate.toString()} - ${contractAlertLevel} | ${maendDate.toString()} - ${maAlertLevel}`}</Typography>
              // </Box>
              <AlertAccordion key={index} expanded={true}>
                <AlertAccordionSummary id={contractendDate.toString()}>
                  <Typography>{`${thedate.format("MMMM YYYY")}`}</Typography>
                </AlertAccordionSummary>
                <AlertAccordionDetails sx={{ bgcolor: bgcolor }}>
                  <Link
                    href={{
                      pathname: "/project/projects",
                      query: { pid: project._id },
                    }}
                  >
                    <Box sx={{ display: "flex", cursor: "pointer" }}>
                      <Typography>{`${project.projName}`}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography>{`${formatDateDMY(
                        contractendDate
                      )}`}</Typography>
                    </Box>
                  </Link>
                </AlertAccordionDetails>
              </AlertAccordion>
            );
          })}
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
}> = async (context) => {
  let retOb: GetStaticPropsResult<{
    presult: ReturnType<typeof compileStatus>[];
  }> = {
    props: { presult: [] },
  };
  _today = dayjs(new Date());
  const conn = await getMongoClient();
  const cres = await ProjectWithInProgressStage(conn, {});
  if (cres) {
    const arresult = await cres.toArray();
    const result = arresult.map((result) => {
      return compileStatus(result);
    });
    retOb = { props: { presult: result }, revalidate: 10 };
  }
  await conn.close();
  return retOb;
};

function calAlertLevel(date: Date, isComplete: boolean): DateDeadlineStatus {
  const mths = -_today.diff(dayjs(date), "months");
  if (mths > 3) {
    return DateDeadlineStatus.Normal;
  } else if (mths >= 0) {
    return isComplete
      ? DateDeadlineStatus.YellowAlert
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
