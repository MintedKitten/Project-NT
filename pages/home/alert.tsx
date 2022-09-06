import type {
  GetStaticProps,
  GetStaticPropsResult,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import {
  Accordion,
  Backdrop,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import { DateDeadlineStatus } from "../../src/local";
import { getMongoClient, projectsInt, stagesInt } from "../../src/db";
import { ProjectWithInProgressStage } from "../../src/server";
import { ObjectId } from "bson";
import PageMenubar from "../../src/components/PageMenubar";
import dayjs from "dayjs";

const AlertPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  result,
}) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

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
          <Accordion TransitionProps={{ unmountOnExit: true }}></Accordion>
          <Typography></Typography>
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
  result: ReturnType<typeof compileStatus>[];
}> = async (context) => {
  let retOb: GetStaticPropsResult<{
    result: ReturnType<typeof compileStatus>[];
  }> = {
    props: { result: [] },
  };
  _today = dayjs(new Date());
  const conn = await getMongoClient();
  const cres = await ProjectWithInProgressStage(conn, {});
  if (cres) {
    const arresult = await cres.toArray();
    const result = arresult.map((result) => {
      return compileStatus(result);
    });
    retOb = { props: { result: result }, revalidate: 1000 };
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
  contractAlertLevel: ReturnType<typeof calAlertLevel>;
  maAlertLevel: ReturnType<typeof calAlertLevel>;
} {
  const { stages_docs, ...dresult } = result;
  const presult = dresult as projectsInt;
  const isComplete = stages_docs.length === 0;
  return {
    project: convtoSerializable(presult),
    isComplete: isComplete,
    contractAlertLevel: calAlertLevel(presult.contractendDate, isComplete),
    maAlertLevel: calAlertLevel(presult.maendDate, false),
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
