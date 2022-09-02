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
import { budgetThreshold, InputEn, navInfo } from "../../src/local";
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
import { projectsInt } from "../../src/db";
import { useConfirmDialog } from "react-mui-confirm";
import { ObjectId } from "bson";
import Space from "../../src/components/Space";
import dayjs from "dayjs";
import Big from "big.js";

const CreateProjectsPage = () => {
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const [success, setSuccess] = useState(false);

  const [tableData, setTableData] =
    useState<projectsTableInt>(projectsDefaultValue);

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
        header: "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท) (สร้างแล้วแก้ไขไม่ได้)",
        value:
          tableData["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"].valueOf() + "",
        type: InputEn.Float,
        onChange: (value) => {
          const format = value.indexOf(".") === value.lastIndexOf(".");
          if (format) {
            if (value.indexOf(".") === value.length - 1) {
              temp["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] = value;
              setTableData(temp);
            } else {
              const fl = valFloat(value);
              if (fl.cmp(0) >= 0) {
                temp["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] =
                  fl.toNumber() + "";
                setTableData(temp);
              }
            }
          }
        },
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
              "Are you sure you want to create a new project with these details?",
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
                const pid = await createNewProject(query);
                setSuccess(true);
                setTimeout(() => {
                  router.push({
                    pathname: "/project/projects",
                    query: { pid: pid.toHexString() },
                  });
                }, 100);
              }
            },
            cancelButtonProps: {
              color: "warning",
            },
            confirmButtonProps: {
              color: "primary",
            },
            confirmButtonText: "Create",
          });
        }}
      >
        Add New Project
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
        skipEmptyLines: true,
      });
      setTableData(convertRawCSVToData(parsedCSV.data[0]));
    };
    reader.readAsText(file);
  };

  const FillFromCSVButtonElement = () => {
    return (
      <Button variant="contained" component="label">
        Import from CSV file
        <input
          type="file"
          hidden
          accept=".csv, text/csv"
          onChange={(e) => {
            handleFileUpload(e);
          }}
        />
      </Button>
    );
  };

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Create New Project</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={navInfo}
            currentTab={"Add New Project"}
            session={data}
          />
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
              Add new project successfully Redirecting to project...
            </Alert>
          </Box>
          <Box sx={{ display: "flex" }}>
            <FillFromCSVButtonElement />
            <Space size={"2px"} direction="column" />
            <Button
              component="a"
              download
              size="small"
              href="/project_template_with_header.csv"
              variant="outlined"
            >
              Get CSV Template
            </Button>
            <Box sx={{ flexGrow: 1 }} />
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

function calculateDiffTime(before: Date, after: Date) {
  const _days = -dayjs(before).diff(dayjs(after), "days");
  const _months = -dayjs(before).diff(dayjs(after), "months");
  const _years = -dayjs(before).diff(dayjs(after), "years");
  let days = _days;
  let bd = dayjs(new Date(before.getFullYear(), 0));
  let year1 = new Date(bd.year(), 0);
  let year2 = new Date(bd.year() + 1, 0);
  let _daysInYear = -dayjs(year1).diff(dayjs(year2), "days");
  while (days >= _daysInYear) {
    console.log(year1, year2, _daysInYear);
    days -= _daysInYear;
    bd = dayjs(bd.year() + 1);
    year1 = new Date(bd.year(), 0);
    year2 = new Date(bd.year() + 1, 0);
    _daysInYear = -dayjs(year1).diff(dayjs(year2), "days");
  }
  return `${_years} ปี ${_months % 12} เดือน ${days} วัน (${_days} วัน)`;
}
