import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import Big from "big.js";
import { ObjectId } from "bson";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { getMongoClient, projectsInt } from "../../src/db";
import {
  budgetThreshold,
  calculateDiffTime,
  InputEn,
  thDate,
} from "../../src/local";
import { ProjectDetails } from "../../src/models/ProjectDetails";
import { getToken } from "next-auth/jwt";
import { checkSession, ProjectWithInProgressStage } from "../../src/server";
import ProjectMenubar from "../../src/components/ProjectMenubar";
import { log } from "../../src/logger";

const ProjectsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresult, isComplete }) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const result = convtoTable(preresult);

  const gridData = [
    {
      header: "รายการโครงการจัดซื้อจัดจ้าง",
      value: result.projName,
      type: InputEn.String,
    },
    {
      header: "ประเภทโครงการ",
      value: result.type,
      type: InputEn.TypeList,
    },
    {
      header: "จำนวนหน่วย",
      value: result.systemCount,
      type: InputEn.Item,
    },
    {
      header: "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)",
      value: result.budget.toNumber(),
      type: InputEn.Float,
    },
    {
      header: "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)",
      value: result.budget.mul(1.07).toNumber(),
      type: InputEn.Calculated,
    },
    {
      header: "ประเภทขั้นตอน",
      value:
        result.budget.cmp(budgetThreshold) < 0
          ? "ขั้นตอนการทำจัดซื้อจัดจ้าง"
          : "ขั้นตอนการทำจัดซื้อจัดจ้าง (นำเสนอคณะกรรมการบริหารฯ และคณะกรรมการบริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)",
      type: InputEn.Calculated,
    },
    {
      header: "ประเภทงบประมาณ",
      value: result.budgetType,
      type: InputEn.String,
    },
    {
      header: "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)",
      value: result.procurementYear,
      type: InputEn.Year,
    },
    {
      header: "วันเริ่มสัญญา (พ.ศ.)",
      value: result.contractstartDate,
      type: InputEn.Date,
    },
    {
      header: "วันหมดสัญญา (พ.ศ.)",
      value: result.contractendDate,
      type: InputEn.Date,
    },
    {
      header: "วันเริ่ม MA (พ.ศ.)",
      value: result.mastartDate,
      type: InputEn.Date,
    },
    {
      header: "วันหมดอายุ MA (พ.ศ.)",
      value: result.maendDate,
      type: InputEn.Date,
    },
    {
      header: "MA (ระยะเวลารับประกัน)",
      value: calculateDiffTime(result.mastartDate, result.maendDate),
      type: InputEn.Calculated,
    },
    {
      header: "หมายเหตุ",
      value: result.comments,
      type: InputEn.String,
    },
  ];

  const TitleButtonElement = () => {
    return (
      <Link href={{ pathname: "/edit/projects", query: { pid: pid } }}>
        <Button
          className="titleButton"
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => {}}
        >
          Edit Project
        </Button>
      </Link>
    );
  };

  /**
   * Authentication: Redirect if not authenicated
   */
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
          {isNavbar ? (
            <>
              <PageNavbar session={data} />
              <ProjectNavbar pid={pid} />
            </>
          ) : (
            <ProjectMenubar session={data} />
          )}
        </PageAppbar>

        <PageContainer>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TitleButtonElement />
            <Box sx={{ flexGrow: 1 }} />
            <Typography>Status:</Typography>
            <Typography sx={{ color: isComplete ? "Green" : "Red", ml: 1 }}>
              {isComplete ? "Complete" : "In Progress"}
            </Typography>
          </Box>
          <Box
            className="details"
            sx={{
              mt: 1,
              border: 1,
              paddingX: 5,
              paddingY: 1,
              borderRadius: 2,
              borderColor: "lightgrey",
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              {gridData.map((data, index) => {
                return (
                  <ProjectDetails
                    key={index}
                    topic={data.header}
                    type={data.type}
                    value={data.value}
                  />
                );
              })}
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

export default ProjectsPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  preresult: ReturnType<typeof convtoSerializable>;
  isComplete: boolean;
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
    msg: "Project details page was queried",
    url: "project/projects",
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
    preresult: ReturnType<typeof convtoSerializable>;
    isComplete: boolean;
  }> = {
    redirect: {
      destination: "/home/status",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const cres = await ProjectWithInProgressStage(conn, {
      _id: new ObjectId(webquery["pid"] as string),
    });
    if (cres) {
      const arresult = await cres.toArray();
      if (arresult.length !== 1) {
        retOb = {
          redirect: {
            destination: "/home/status",
            permanent: false,
          },
        };
      } else {
        const { stages_docs, ...dresult } = arresult[0];
        const presult = dresult as projectsInt;
        const conv = convtoSerializable(presult);
        retOb = {
          props: {
            pid: webquery.pid as string,
            preresult: conv,
            isComplete: stages_docs.length === 0,
          },
        };
      }
    }
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

/**
 * Convert serialized data back to usable data
 * @param data
 * @returns
 */
function convtoTable(
  data: ReturnType<typeof convtoSerializable>
): Omit<projectsInt, "createdby" | "lastupdate"> {
  const {
    _id: s_id,
    budget: sbudget,
    contractstartDate: scontractstartDate,
    contractendDate: scontractendDate,
    mastartDate: smastartDate,
    maendDate: smaendDate,
    ...r
  } = data;
  return {
    _id: new ObjectId(s_id),
    contractstartDate: thDate(scontractstartDate),
    contractendDate: thDate(scontractendDate),
    mastartDate: thDate(smastartDate),
    maendDate: thDate(smaendDate),
    budget: Big(sbudget),
    ...r,
  };
}
