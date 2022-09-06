import type {
  GetStaticProps,
  GetStaticPropsResult,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import { DateDeadlineStatus, navInfo, thDate } from "../../src/local";
import { getMongoClient, projectsInt, stagesInt } from "../../src/db";
import { ProjectWithInProgressStage } from "../../src/server";
import Big from "big.js";
import { ObjectId } from "bson";

const AlertPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  result,
}) => {
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
          <PageNavbar navlink={navInfo} currentTab={"Home"} session={data} />
        </PageAppbar>
        <PageContainer>
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

export const getStaticProps: GetStaticProps<{
  result: ReturnType<typeof compileStatus>[];
}> = async (context) => {
  let retOb: GetStaticPropsResult<{
    result: ReturnType<typeof compileStatus>[];
  }> = {
    props: { result: [] },
  };
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

const _today = new Date();
function calAlertLevel(date: Date, isComplete: boolean): DateDeadlineStatus {
  if (date.getTime() - _today.getTime() < 0) {
    return DateDeadlineStatus.Passed;
  } else {
    if (
      _today.getMonth() - date.getMonth() <= 3 &&
      _today.getFullYear() - date.getFullYear() === 0
    ) {
      return isComplete
        ? DateDeadlineStatus.YellowAlert
        : DateDeadlineStatus.RedAlert;
    } else {
      return DateDeadlineStatus.Normal;
    }
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
    maAlertLevel: calAlertLevel(presult.maendDate, isComplete),
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

// function convtoTable(
//   data: ReturnType<typeof convtoSerializable>
// ): Omit<projectsInt, "createdby" | "lastupdate"> {
//   const {
//     _id: s_id,
//     budget: sbudget,
//     contractstartDate: scontractstartDate,
//     contractendDate: scontractendDate,
//     mastartDate: smastartDate,
//     maendDate: smaendDate,
//     ...r
//   } = data;
//   return {
//     _id: new ObjectId(s_id),
//     contractstartDate: thDate(scontractstartDate),
//     contractendDate: thDate(scontractendDate),
//     mastartDate: thDate(smastartDate),
//     maendDate: thDate(smaendDate),
//     budget: Big(sbudget),
//     ...r,
//   };
// }
