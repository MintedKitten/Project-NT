import { ChangeEvent, useState } from "react";
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
import { InputEn, thDate } from "../../src/local";
import {
  convertRawCSVToData,
  createNewProject,
  projectsDefaultValue,
  projectsTableInt,
  valDate,
  valFloat,
  valItem,
  valTypeList,
  valYear,
} from "../../src/create/projects";
import { parse as parsecsv } from "papaparse";
import { getMongoClient, projectFindOne, projectsInt } from "../../src/db";
import { useConfirmDialog } from "react-mui-confirm";
import { ObjectId } from "bson";
import Space from "../../src/components/Space";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Big from "big.js";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { updateProject } from "../../src/edit/projects";

const CreateProjectsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, preresult }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const [success, setSuccess] = useState(false);

  const [tableData, setTableData] = useState<projectsTableInt>(
    convtoTable(preresult)
  );

  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;

  const tableBody: () => ProjectDetailsInputType[] = () => {
    let temp = { ...tableData };
    const tBody: ProjectDetailsInputType[] = [
      {
        id: 0 + "",
        header: "รายการโครงการจัดซื้อจัดจ้าง",
        value: tableData["รายการโครงการจัดซื้อจัดจ้าง"] + "",
        type: InputEn.String,
        onChange: (value) => {
          temp["รายการโครงการจัดซื้อจัดจ้าง"] = value;
          setTableData(temp);
        },
      },
      {
        id: 1 + "",
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
        id: 2 + "",
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
        id: 3 + "",
        header: "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)",
        value:
          tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"].valueOf() + "",
        type: InputEn.Float,
        onChange: (value) => {
          const fl = valFloat(value);
          if (fl.cmp(0) >= 0) {
            temp["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] = fl;
            setTableData(temp);
          }
        },
      },
      {
        id: 4 + "",
        header: "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)",
        value: tableData["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"] + "",
        type: InputEn.Float,
        onChange: (value) => {
          const fl = valFloat(value);
          if (fl.cmp(0) >= 0) {
            temp["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] = fl;
            setTableData(temp);
          }
        },
      },
      {
        id: 5 + "",
        header: "ประเภทงบประมาณ",
        value: tableData["ประเภทงบประมาณ"] + "",
        type: InputEn.String,
        onChange: (value) => {
          temp["ประเภทงบประมาณ"] = value;
          setTableData(temp);
        },
      },
      {
        id: 6 + "",
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
        id: 7 + "",
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
        id: 8 + "",
        header: "MA (ระยะเวลารับประกัน)",
        value: JSON.stringify(tableData["MA (ระยะเวลารับประกัน)"]),
        type: InputEn.Item,
        onChange: (value) => {
          const item = valItem(value);
          if (item.amount < 0) {
            temp["MA (ระยะเวลารับประกัน)"] = { amount: 0, unit: item.unit };
          } else {
            temp["MA (ระยะเวลารับประกัน)"] = item;
          }
          setTableData(temp);
        },
      },
      {
        id: 9 + "",
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
        id: 10 + "",
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
        id: 11 + "",
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
                  รายการโครงการจัดซื้อจัดจ้าง:
                    tableData["รายการโครงการจัดซื้อจัดจ้าง"],
                  ประเภทโครงการ: tableData["ประเภทโครงการ"],
                  จำนวนหน่วย: tableData["จำนวนหน่วย"],
                  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)":
                    tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"],
                  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)":
                    tableData["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"],
                  ประเภทงบประมาณ: tableData["ประเภทงบประมาณ"],
                  ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist:
                    tableData[
                      "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)"
                    ].getFullYear(),
                  วันเริ่มสัญญา_buddhist: tableData["วันเริ่มสัญญา (พ.ศ.)"],
                  "MA (ระยะเวลารับประกัน)": tableData["MA (ระยะเวลารับประกัน)"],
                  "วันเริ่ม MA_buddhist": tableData["วันเริ่ม MA (พ.ศ.)"],
                  "วันหมดอายุ MA_buddhist": tableData["วันหมดอายุ MA (พ.ศ.)"],
                  หมายเหตุ: tableData["หมายเหตุ"],
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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (!evt?.target?.result) {
        return;
      }
      const { result } = evt.target;
      const parsedCSV = parsecsv<projectsInt>(result.toString(), {
        header: true,
        dynamicTyping: true,
      });
      setTableData(convertRawCSVToData(parsedCSV.data[0]));
    };
    // reader.readAsBinaryString(file);
    reader.readAsText(file);
  };

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Update Project</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={[
              { Header: "Search Project", Link: "/search/projects" },
              { Header: "Search Equipments", Link: "/search/equipments" },
              { Header: "Add New Project", Link: "/create/projects" },
            ]}
            currentTab={"Project"}
            session={data}
          />
          <ProjectNavbar
            navlink={[
              { Header: "Details", Link: "/project/projects" },
              { Header: "Files", Link: "/project/files" },
              { Header: "Equipments", Link: "/project/equipments" },
              { Header: "Stages", Link: "/project/stages" },
            ]}
            currentTab={"Details Edit"}
            pid={pid}
          />
        </PageAppbar>
        <PageContainer>
          <Box
            sx={{ display: success ? "flex" : "none", alignItems: "center" }}
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
  conn.close();
  if (!presult) {
    return {
      redirect: {
        destination: "/search/projects",
        permanent: false,
      },
    };
  } else {
    const conv = convtoSerializable(presult);
    return { props: { pid: webquery.pid as string, preresult: conv } };
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

function convtoTable(
  data: ReturnType<typeof convtoSerializable>
): projectsTableInt {
  const {
    _id: s_id,
    createdby: screatedby,
    lastupdate: slastupdate,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudgetWT,
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudget,
    วันเริ่มสัญญา_buddhist: sstartCdt,
    "วันเริ่ม MA_buddhist": sstartMAdt,
    "วันหมดอายุ MA_buddhist": sendMAdt,
    ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist: purchasedt,
    ...r
  } = data;
  return {
    "วันเริ่มสัญญา (พ.ศ.)": thDate(sstartCdt),
    "วันเริ่ม MA (พ.ศ.)": thDate(sstartMAdt),
    "วันหมดอายุ MA (พ.ศ.)": thDate(sendMAdt),
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": Big(sbudget),
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": Big(sbudgetWT),
    "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": thDate(purchasedt),
    ...r,
  };
}
