import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import Big from "big.js";
import { ObjectId } from "bson";
import {
  GetServerSideProps,
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
import {
  getMongoClient,
  projectFindOne,
  projectsInt,
  stagesFindAll,
} from "../../src/db";
import {
  budgetThreshold,
  InputEn,
  navInfo,
  projectNavInfo,
  StagesProgress,
  thDate,
} from "../../src/local";
import { ProjectDetails } from "../../src/models/ProjectDetails";
import { getToken } from "next-auth/jwt";
import dayjs from "dayjs";

const ProjectsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresult, isComplete }) => {
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
      <Link
        href={{ pathname: "/edit/projects", query: { pid: pid } }}
        as={"/edit/projects"}
      >
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
          <PageNavbar navlink={navInfo} currentTab={-1} session={data} />
          <ProjectNavbar
            navlink={projectNavInfo}
            currentTab={"Details"}
            pid={pid}
          />
        </PageAppbar>

        <PageContainer>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TitleButtonElement />
            <Box sx={{ flexGrow: 1 }} />
            <Typography>Status:</Typography>
            <Typography sx={{ color: isComplete ? "Green" : "Red", ml: 1 }}>
              {isComplete ? "Complete" : "On Going"}
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
        destination: "/search/projects",
        permanent: false,
      },
    };
  }
  const conn = await getMongoClient();
  const presult = await projectFindOne(conn, {
    _id: new ObjectId(webquery["pid"] as string),
  });
  const stages = await stagesFindAll(conn, {
    projId: new ObjectId(webquery["pid"]),
  });
  let isComplete = true;
  for (let index = 0; index < stages.length; index++) {
    const element = stages[index];
    if (element.status === StagesProgress.OnGoing) {
      isComplete = false;
      break;
    }
  }
  await conn.close();
  if (!presult) {
    return {
      redirect: {
        destination: "/search/projects",
        permanent: false,
      },
    };
  } else {
    const conv = convtoSerializable(presult);
    return {
      props: {
        pid: webquery.pid as string,
        preresult: conv,
        isComplete: isComplete,
      },
    };
  }
};

function convtoSerializable(data: projectsInt) {
  const {
    _id,
    createdby,
    lastupdate,
    budget,
    contractstartDate,
    contractendDate,
    mastartDate,
    maendDate,
    ...r
  } = data;
  return {
    _id: (_id as ObjectId).toHexString(),
    createdby: createdby.toHexString(),
    lastupdate: lastupdate.toString(),
    contractstartDate: contractstartDate.toString(),
    contractendDate: contractendDate.toString(),
    mastartDate: mastartDate.toString(),
    maendDate: maendDate.toString(),
    budget: budget.toString(),
    ...r,
  };
}

function convtoTable(data: ReturnType<typeof convtoSerializable>): projectsInt {
  const {
    _id: s_id,
    createdby: screatedby,
    lastupdate: slastupdate,
    budget: sbudget,
    contractstartDate: scontractstartDate,
    contractendDate: scontractendDate,
    mastartDate: smastartDate,
    maendDate: smaendDate,
    ...r
  } = data;
  return {
    _id: new ObjectId(s_id),
    createdby: new ObjectId(screatedby),
    lastupdate: thDate(slastupdate),
    contractstartDate: thDate(scontractstartDate),
    contractendDate: thDate(scontractendDate),
    mastartDate: thDate(smastartDate),
    maendDate: thDate(smaendDate),
    budget: Big(sbudget),
    ...r,
  };
}

function calculateDiffTime(before: Date, after: Date) {
  const _days = -dayjs(before).diff(dayjs(after), "days");
  let days = _days;
  let months = Math.floor(days / 30);
  days %= 30;
  let years = Math.floor(months / 12);
  months %= 12;
  return `${years} ปี ${months} เดือน(30) ${days} วัน`;
}
