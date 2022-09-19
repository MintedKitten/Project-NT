import { useState } from "react";
import {
  Backdrop,
  CircularProgress,
  useMediaQuery,
  Grid,
  Box,
  Button,
  Alert,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageNavbar from "../../src/components/PageNavbar";
import PageContainer from "../../src/components/PageContainer";
import { isMobile } from "react-device-detect";
import {
  ProjectDetailsInput,
  ProjectDetailsInputType,
} from "../../src/models/ProjectDetailsInput";
import {
  budgetThreshold,
  calculateDiffTime,
  InputEn,
  thDate,
} from "../../src/local";
import {
  projectsTableInt,
  valDate,
  valItem,
  valTypeList,
  valYear,
} from "../../src/create/projects";
import { getMongoClient, projectFindOne, projectsInt } from "../../src/db";
import { useConfirmDialog } from "react-mui-confirm";
import { ObjectId } from "bson";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Big from "big.js";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { updateProject } from "../../src/edit/projects";
import { getToken } from "next-auth/jwt";
import { log } from "../../src/logger";
import ProjectMenubar from "../../src/components/ProjectMenubar";

const CreateProjectsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresult }) => {
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const [success, setSuccess] = useState(false);

  const [tableData, setTableData] = useState<projectsTableInt>(
    convtoTable(preresult)
  );

  const tableBody: () => ProjectDetailsInputType[] = () => {
    let temp = { ...tableData };
    const tBody: ProjectDetailsInputType[] = [
      {
        id: "รายการโครงการจัดซื้อจัดจ้าง",
        header: "รายการโครงการจัดซื้อจัดจ้าง",
        value: tableData["รายการโครงการจัดซื้อจัดจ้าง"] + "",
        type: InputEn.String,
        onChange: (value) => {
          temp["รายการโครงการจัดซื้อจัดจ้าง"] = value;
          setTableData(temp);
        },
      },
      {
        id: "ประเภทโครงการ",
        header: "ประเภทโครงการ",
        value: tableData["ประเภทโครงการ"] + "",
        type: InputEn.TypeList,
        onChange: (value) => {
          if (value) {
            try {
              temp["ประเภทโครงการ"] = valTypeList(value);
              setTableData(temp);
            } catch (err) {
              temp["ประเภทโครงการ"] = 0;
              setTableData(temp);
            }
          }
        },
      },
      {
        id: "จำนวนหน่วย",
        header: "จำนวนหน่วย",
        value: JSON.stringify(tableData["จำนวนหน่วย"]),
        type: InputEn.Item,
        onChange: (value) => {
          const item = valItem(value);
          if (item.amount < 0) {
            temp["จำนวนหน่วย"] = { amount: 0, unit: item.unit };
          } else {
            temp["จำนวนหน่วย"] = item;
          }
          setTableData(temp);
        },
      },
      {
        id: "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)",
        header: "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)",
        value:
          tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"].valueOf() + "",
        type: InputEn.Calculated,
        onChange() {},
      },
      {
        id: "ประเภทขั้นตอน",
        header: "ประเภทขั้นตอน",
        value:
          Big(tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"]).cmp(
            budgetThreshold
          ) < 0
            ? "ขั้นตอนการทำจัดซื้อจัดจ้าง"
            : "ขั้นตอนการทำจัดซื้อจัดจ้าง (นำเสนอคณะกรรมการบริหารฯ และคณะกรรมการบริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน)",
        type: InputEn.Calculated,
        onChange() {},
      },
      {
        id: "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)",
        header: "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)",
        value:
          Big(tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"])
            .mul(1.07)
            .valueOf() + "",
        type: InputEn.Calculated,
        onChange() {},
      },
      {
        id: "ประเภทงบประมาณ",
        header: "ประเภทงบประมาณ",
        value: tableData["ประเภทงบประมาณ"] + "",
        type: InputEn.String,
        onChange: (value) => {
          temp["ประเภทงบประมาณ"] = value;
          setTableData(temp);
        },
      },
      {
        id: "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)",
        header: "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)",
        value: tableData["ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)"].toISOString(),
        type: InputEn.Year,
        onChange: (value) => {
          const yr = valYear(value);
          if (yr) {
            temp["ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)"] = yr;
            setTableData(temp);
          }
        },
      },
      {
        id: "วันเริ่มสัญญา (พ.ศ.)",
        header: "วันเริ่มสัญญา (พ.ศ.)",
        value: tableData["วันเริ่มสัญญา (พ.ศ.)"].toISOString(),
        type: InputEn.Date,
        onChange: (value) => {
          const dt = valDate(value);
          if (dt) {
            temp["วันเริ่มสัญญา (พ.ศ.)"] = dt;
            setTableData(temp);
          }
        },
      },
      {
        id: "วันหมดสัญญา (พ.ศ.)",
        header: "วันหมดสัญญา (พ.ศ.)",
        value: tableData["วันหมดสัญญา (พ.ศ.)"].toISOString(),
        type: InputEn.Date,
        onChange: (value) => {
          const dt = valDate(value);
          if (dt) {
            temp["วันหมดสัญญา (พ.ศ.)"] = dt;
            setTableData(temp);
          }
        },
      },
      {
        id: "วันเริ่ม MA (พ.ศ.)",
        header: "วันเริ่ม MA (พ.ศ.)",
        value: tableData["วันเริ่ม MA (พ.ศ.)"].toISOString(),
        type: InputEn.Date,
        onChange: (value) => {
          const dt = valDate(value);
          if (dt) {
            temp["วันเริ่ม MA (พ.ศ.)"] = dt;
            setTableData(temp);
          }
        },
      },
      {
        id: "วันหมดอายุ MA (พ.ศ.)",
        header: "วันหมดอายุ MA (พ.ศ.)",
        value: tableData["วันหมดอายุ MA (พ.ศ.)"].toISOString(),
        type: InputEn.Date,
        onChange: (value) => {
          const dt = valDate(value);
          if (dt) {
            temp["วันหมดอายุ MA (พ.ศ.)"] = dt;
            setTableData(temp);
          }
        },
      },
      {
        id: "MA (ระยะเวลารับประกัน)",
        header: "MA (ระยะเวลารับประกัน)",
        value: calculateDiffTime(
          tableData["วันเริ่ม MA (พ.ศ.)"],
          tableData["วันหมดอายุ MA (พ.ศ.)"]
        ),
        type: InputEn.Calculated,
        onChange() {},
      },
      {
        id: "หมายเหตุ",
        header: "หมายเหตุ",
        value: tableData["หมายเหตุ"] + "",
        type: InputEn.String,
        onChange: (value) => {
          temp["หมายเหตุ"] = value;
          setTableData(temp);
        },
      },
    ];
    return tBody;
  };

  const openConfirmDialog = useConfirmDialog();
  const TitleButtonElement = () => {
    return (
      <Button
        className="titleButton"
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => {
          openConfirmDialog({
            title:
              "Are you sure you want to update the project with these details?",
            onConfirm: async () => {
              if (data) {
                const query: projectsInt = {
                  projName: tableData["รายการโครงการจัดซื้อจัดจ้าง"],
                  type: tableData["ประเภทโครงการ"],
                  systemCount: tableData["จำนวนหน่วย"],
                  budget: Big(
                    tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"]
                  ),
                  budgetType: tableData["ประเภทงบประมาณ"],
                  procurementYear:
                    tableData[
                      "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)"
                    ].getFullYear(),
                  contractstartDate: tableData["วันเริ่มสัญญา (พ.ศ.)"],
                  contractendDate: tableData["วันหมดสัญญา (พ.ศ.)"],
                  mastartDate: tableData["วันเริ่ม MA (พ.ศ.)"],
                  maendDate: tableData["วันหมดอายุ MA (พ.ศ.)"],
                  comments: tableData["หมายเหตุ"],
                  createdby: new ObjectId("" + data.id),
                  lastupdate: new Date(),
                };
                const isUpdated = await updateProject(pid, query);
                if (isUpdated) {
                  setSuccess(true);
                  setTimeout(() => {
                    router.push(
                      {
                        pathname: "/project/projects",
                        query: { pid: pid },
                      },
                      "/project/projects"
                    );
                  }, 100);
                }
              }
            },
            cancelButtonProps: {
              color: "warning",
            },
            confirmButtonProps: {
              color: "primary",
            },
            confirmButtonText: "Update",
          });
        }}
      >
        Update Project
      </Button>
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
          <title>Update Project Details</title>
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
          <Box
            sx={{
              display: success ? "flex" : "none",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Alert severity="success">
              Update project successfully Redirecting to project...
            </Alert>
          </Box>
          <Box sx={{ display: "flex" }}>
            <TitleButtonElement />
          </Box>
          <Box
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
              {tableBody().map((item, index) => {
                return (
                  <ProjectDetailsInput
                    key={index}
                    id={index + ""}
                    header={item.header}
                    value={item.value}
                    type={item.type}
                    onChange={item.onChange}
                    isDisplayMobile={isDisplayMobile}
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

export default CreateProjectsPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  preresult: ReturnType<typeof convtoSerializable>;
}> = async (context) => {
  const token = await getToken({
    req: context.req,
    secret: `${process.env.JWT_SECRET}`,
  });
  if (!token) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
  const toLog = {
    msg: "Edit project details page was queried",
    url: "edit/projects",
    token: token,
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
  }> = {
    redirect: {
      destination: "/home/status",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const presult = await projectFindOne(conn, {
      _id: new ObjectId(webquery["pid"] as string),
    });
    if (!presult) {
      retOb = {
        redirect: {
          destination: "/home/status",
          permanent: false,
        },
      };
    } else {
      const conv = convtoSerializable(presult);
      retOb = { props: { pid: webquery.pid as string, preresult: conv } };
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

/**
 * Convert serialized data back to usable data
 * @param data
 * @returns
 */
function convtoTable(
  data: ReturnType<typeof convtoSerializable>
): projectsTableInt {
  const {
    _id: s_id,
    createdby: screatedby,
    lastupdate: slastupdate,
    budget: sbudget,
    contractstartDate: scontractstartDate,
    contractendDate: scontractendDate,
    mastartDate: smastartDate,
    maendDate: smaendDate,
    procurementYear: sprocYear,
    ...r
  } = data;
  return {
    "วันเริ่มสัญญา (พ.ศ.)": thDate(scontractstartDate),
    "วันหมดสัญญา (พ.ศ.)": thDate(scontractendDate),
    "วันเริ่ม MA (พ.ศ.)": thDate(smastartDate),
    "วันหมดอายุ MA (พ.ศ.)": thDate(smaendDate),
    "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": thDate(sprocYear),
    รายการโครงการจัดซื้อจัดจ้าง: r.projName,
    ประเภทโครงการ: r.type,
    จำนวนหน่วย: r.systemCount,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": "",
    ประเภทงบประมาณ: r.budgetType,
    หมายเหตุ: r.comments,
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudget,
    "MA (ระยะเวลารับประกัน)": "",
  };
}
