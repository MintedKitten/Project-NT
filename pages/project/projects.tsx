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
  InputEn,
  navInfo,
  projectNavInfo,
  StagesProgress,
  thDate,
} from "../../src/local";
import { ProjectDetails } from "../../src/models/ProjectDetails";
import { getToken } from "next-auth/jwt";

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
      value: result["รายการโครงการจัดซื้อจัดจ้าง"],
      type: InputEn.String,
    },
    {
      header: "ประเภทโครงการ",
      value: result["ประเภทโครงการ"] + "",
      type: InputEn.TypeList,
    },
    {
      header: "จำนวนหน่วย",
      value: result["จำนวนหน่วย"],
      type: InputEn.Item,
    },
    {
      header: "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)",
      value: result["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"],
      type: InputEn.Float,
    },
    {
      header: "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)",
      value: result["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"],
      type: InputEn.Float,
    },
    {
      header: "ประเภทงบประมาณ",
      value: result["ประเภทงบประมาณ"],
      type: InputEn.String,
    },
    {
      header: "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)",
      value: result["ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist"],
      type: InputEn.Year,
    },
    {
      header: "วันเริ่มสัญญา (พ.ศ.)",
      value: result["วันเริ่มสัญญา_buddhist"],
      type: InputEn.Date,
    },
    {
      header: "MA (ระยะเวลารับประกัน)",
      value: result["MA (ระยะเวลารับประกัน)"],
      type: InputEn.Item,
    },
    {
      header: "วันเริ่ม MA (พ.ศ.)",
      value: result["วันเริ่ม MA_buddhist"],
      type: InputEn.Date,
    },
    {
      header: "วันหมดอายุ MA (พ.ศ.)",
      value: result["วันหมดอายุ MA_buddhist"],
      type: InputEn.Date,
    },
    {
      header: "หมายเหตุ",
      value: result["หมายเหตุ"],
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
          <Box sx={{ display: "flex" }}>
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
        destination: "/project/",
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
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": budgetWT,
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": budget,
    วันเริ่มสัญญา_buddhist: startCdt,
    "วันเริ่ม MA_buddhist": startMAdt,
    "วันหมดอายุ MA_buddhist": endMAdt,
    ...r
  } = data;
  return {
    _id: (_id as ObjectId).toHexString(),
    createdby: createdby.toHexString(),
    lastupdate: lastupdate.toString(),
    วันเริ่มสัญญา_buddhist: startCdt.toString(),
    "วันเริ่ม MA_buddhist": startMAdt.toString(),
    "วันหมดอายุ MA_buddhist": endMAdt.toString(),
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": budget.toString(),
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": budgetWT.toString(),
    ...r,
  };
}

function convtoTable(data: ReturnType<typeof convtoSerializable>): projectsInt {
  const {
    _id: s_id,
    createdby: screatedby,
    lastupdate: slastupdate,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudgetWT,
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudget,
    วันเริ่มสัญญา_buddhist: sstartCdt,
    "วันเริ่ม MA_buddhist": sstartMAdt,
    "วันหมดอายุ MA_buddhist": sendMAdt,
    ...r
  } = data;
  return {
    _id: new ObjectId(s_id),
    createdby: new ObjectId(screatedby),
    lastupdate: thDate(slastupdate),
    วันเริ่มสัญญา_buddhist: thDate(sstartCdt),
    "วันเริ่ม MA_buddhist": thDate(sstartMAdt),
    "วันหมดอายุ MA_buddhist": thDate(sendMAdt),
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": Big(sbudget),
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": Big(sbudgetWT),
    ...r,
  };
}
