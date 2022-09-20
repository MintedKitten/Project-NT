import type {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  Backdrop,
  Box,
  CircularProgress,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { orange, red } from "@mui/material/colors";
import {
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  OfflinePin as OfflinePinIcon,
  OpenInBrowser as OpenInBrowserIcon,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import {
  DateDeadlineStatus,
  DeadlineName,
  formatDateDDMMYY,
} from "../../src/local";
import { getMongoClient, projectsInt, stagesInt } from "../../src/db";
import { ProjectWithInProgressStage } from "../../src/server";
import { ObjectId } from "bson";
import PageMenubar from "../../src/components/PageMenubar";
import dayjs from "dayjs";
import { useState } from "react";
import {
  DataGrid,
  GridActionsCellItem,
  GridColumnGroupingModel,
  GridColumns,
  GridRowsProp,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import Big from "big.js";
import { log } from "../../src/logger";
import { getToken } from "next-auth/jwt";

type rowsType = {
  id: string;
  projName: string;
  contractstartDate: Date;
  contractendDate: Date;
  contractAlert: DateDeadlineStatus;
  mastartDate: Date;
  maendDate: Date;
  maAlert: DateDeadlineStatus;
};

function resultToRow(row: ReturnType<typeof compileBackStatus>): rowsType {
  const { project, contractAlertLevel, maAlertLevel } = row;
  return {
    id: `${project._id?.toHexString()}`,
    projName: project.projName,
    contractstartDate: project.contractstartDate,
    contractendDate: project.contractendDate,
    contractAlert: contractAlertLevel,
    mastartDate: project.mastartDate,
    maendDate: project.maendDate,
    maAlert: maAlertLevel,
  };
}

function getAlertElement(status: DateDeadlineStatus) {
  if (status === DateDeadlineStatus.Normal) {
    return (
      <Box sx={{ display: "flex" }}>
        <PendingIcon color="info" />
        <Typography sx={{ ml: 0.5 }}>{DeadlineName[0]}</Typography>
      </Box>
    );
  }
  if (status === DateDeadlineStatus.Complete) {
    return (
      <Box sx={{ display: "flex" }}>
        <CheckCircleIcon color="success" />
        <Typography sx={{ ml: 0.5 }}>{DeadlineName[1]}</Typography>
      </Box>
    );
  }
  if (status === DateDeadlineStatus.Alert) {
    return (
      <Box sx={{ display: "flex" }}>
        <WarningIcon color="warning" />
        <Typography sx={{ ml: 0.5 }}>{DeadlineName[2]}</Typography>
      </Box>
    );
  }
  if (status === DateDeadlineStatus.Passed) {
    return (
      <Box sx={{ display: "flex" }}>
        <OfflinePinIcon color="success" />
        <Typography sx={{ ml: 0.5 }}>{DeadlineName[3]}</Typography>
      </Box>
    );
  }
  if (status === DateDeadlineStatus.PastDue) {
    return (
      <Box sx={{ display: "flex" }}>
        <span
          className="material-symbols-outlined"
          style={{ color: red["A400"] }}
        >
          emergency_home
        </span>
        <Typography sx={{ ml: 0.5 }}>{DeadlineName[4]}</Typography>
      </Box>
    );
  }
  return (
    <>
      <Typography>{status}</Typography>
    </>
  );
}

const AlertPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ presult }) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangeRowsPerPage = (pageSize: number) => {
    setRowsPerPage(pageSize);
  };

  const results = presult.map((res) => {
    return compileBackStatus(res);
  });

  const rows: GridRowsProp<rowsType> = results.map((res) => {
    return resultToRow(res);
  });

  const columnDef: GridColumns = [
    {
      field: "projName",
      type: "string",
      headerName: "รายการโครงการจัดซื้อจัดจ้าง",
      hideable: false,
      flex: 1,
      minWidth: 350,
    },
    {
      field: "contractstartDate",
      type: "date",
      headerName: "วันเริ่มสัญญา (พ.ศ.)",
      hideable: false,
      width: 150,
      valueFormatter: (params) => {
        const { value } = params;
        return formatDateDDMMYY(value);
      },
    },
    {
      field: "contractendDate",
      type: "date",
      headerName: "วันหมดสัญญา (พ.ศ.)",
      hideable: false,
      width: 150,
      valueFormatter: (params) => {
        const { value } = params;
        return formatDateDDMMYY(value);
      },
    },
    {
      field: "contractAlert",
      type: "singleSelect",
      headerName: "Alert Contract",
      hideable: false,
      width: 125,
      valueOptions: DeadlineName,
      valueGetter: (params) => {
        const { value } = params;
        return DeadlineName[value];
      },
      renderCell: (params) => {
        const { value } = params;
        return getAlertElement(DeadlineName.indexOf(value));
      },
    },
    {
      field: "mastartDate",
      type: "date",
      headerName: "วันเริ่ม MA (พ.ศ.)",
      hideable: false,
      width: 150,
      valueFormatter: (params) => {
        const { value } = params;
        return formatDateDDMMYY(value);
      },
    },
    {
      field: "maendDate",
      type: "date",
      headerName: "วันหมดอายุ MA (พ.ศ.)",
      hideable: false,
      width: 150,
      valueFormatter: (params) => {
        const { value } = params;
        return formatDateDDMMYY(value);
      },
    },
    {
      field: "maAlert",
      type: "string",
      headerName: "Alert MA",
      hideable: false,
      width: 125,
      renderCell: (params) => {
        const { value } = params;
        return getAlertElement(value);
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      hideable: false,
      width: 65,
      cellClassName: "actions",
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key={`${id.toString()}_open`}
            icon={
              <Tooltip title="Open Project" arrow>
                <OpenInBrowserIcon fontSize="small" color="action" />
              </Tooltip>
            }
            label="Open"
            className="textPrimary"
            onClick={() => {
              router.push({
                pathname: "/project/projects",
                query: { pid: id },
              });
            }}
          />,
        ];
      },
    },
  ];

  const columnGroupingModel: GridColumnGroupingModel = [
    {
      groupId: "ระยะเวลาสัญญา (พ.ศ.)",
      children: [
        { field: "contractstartDate" },
        { field: "contractendDate" },
        { field: "contractAlert" },
      ],
      description: "วันเดือนปี และสถานะของ Project",
    },
    {
      groupId: "ระยะเวลาอายุ MA (พ.ศ.)",
      children: [
        { field: "mastartDate" },
        { field: "maendDate" },
        { field: "maAlert" },
      ],
      description: "วันเดือนปี และสถานะของ MA",
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarDensitySelector />
        <GridToolbarFilterButton />
        <GridToolbarExport
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{ utf8WithBom: true }}
        />
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }

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
          <title>Home Page</title>
        </Head>
        <PageAppbar>
          {isNavbar ? (
            <PageNavbar session={data} />
          ) : (
            <PageMenubar session={data} />
          )}
        </PageAppbar>

        <PageContainer maxWidth="xl">
          <Box
            sx={{
              height: "89.5vh",
              mt: 1,
              "& .conalert-theme--Late": { bgcolor: red[50] },
              "& .conalert-theme--HighPriority": {
                bgcolor: orange[50],
              },
            }}
          >
            <DataGrid
              rows={rows}
              columns={columnDef}
              pageSize={rowsPerPage}
              onPageSizeChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
              components={{ Toolbar: CustomToolbar }}
              columnGroupingModel={columnGroupingModel}
              disableColumnSelector
              experimentalFeatures={{ columnGrouping: true }}
              getRowClassName={(params) => {
                return `conalert-theme--${DeadlineName[params.row.contractAlert]
                  .split(" ")
                  .join("")} maalert-theme--${DeadlineName[params.row.maAlert]
                  .split(" ")
                  .join("")}`;
              }}
            />
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
export const getServerSideProps: GetServerSideProps<{
  presult: ReturnType<typeof compileStatus>[];
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
    msg: "Status page was queried",
    url: "home/status",
    token: token,
    query: context.query,
  };
  log(JSON.stringify(toLog));
  let retOb: GetServerSidePropsResult<{
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
      retOb = { props: { presult: result } };
    }
  } catch (err) {
    alert(err);
  }
  await conn.close();
  return retOb;
};

/**
 * Calculate Alert level for Contract End Date
 * @param date
 * @param isComplete
 * @returns
 */
function calContractAlertLevel(
  date: Date,
  isComplete: boolean
): DateDeadlineStatus {
  const mths = -_today.diff(dayjs(date), "months");
  const days = -_today.diff(dayjs(date), "days");
  if (mths > 3) {
    return isComplete ? DateDeadlineStatus.Complete : DateDeadlineStatus.Normal;
  } else if (mths >= 0 && days > 0) {
    return isComplete ? DateDeadlineStatus.Complete : DateDeadlineStatus.Alert;
  } else {
    return isComplete ? DateDeadlineStatus.Passed : DateDeadlineStatus.PastDue;
  }
}

/**
 * Calculate Alert level for MA End Date
 * @param date
 * @returns
 */
function calMAAlertLevel(date: Date): DateDeadlineStatus {
  const days = -_today.diff(dayjs(date), "days");
  if (days > 0) {
    return DateDeadlineStatus.Normal;
  } else {
    return DateDeadlineStatus.Passed;
  }
}

/**
 * Serialize data and add additional data
 * @param result
 * @returns
 */
function compileStatus(
  result: projectsInt & {
    stages_docs: stagesInt[];
  }
): {
  project: ReturnType<typeof convtoSerializable>;
  isComplete: boolean;
  contractAlertLevel: ReturnType<typeof calContractAlertLevel>;
  maAlertLevel: ReturnType<typeof calMAAlertLevel>;
} {
  const { stages_docs, ...dresult } = result;
  const presult = dresult as projectsInt;
  const isComplete = stages_docs.length === 0;
  return {
    project: convtoSerializable(presult),
    isComplete: isComplete,
    contractAlertLevel: calContractAlertLevel(
      presult.contractendDate,
      isComplete
    ),
    maAlertLevel: calMAAlertLevel(presult.maendDate),
  };
}

/**
 * Convert serialized data back to usable data with additional data
 * @param data
 * @returns
 */
function compileBackStatus(data: ReturnType<typeof compileStatus>): {
  project: ReturnType<typeof convBack>;
  isComplete: boolean;
  contractAlertLevel: ReturnType<typeof calContractAlertLevel>;
  maAlertLevel: ReturnType<typeof calContractAlertLevel>;
} {
  const { project: sproject, ...r } = data;
  return {
    project: convBack(sproject),
    ...r,
  };
}

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
function convBack(
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
    contractstartDate: new Date(scontractstartDate),
    contractendDate: new Date(scontractendDate),
    mastartDate: new Date(smastartDate),
    maendDate: new Date(smaendDate),
    budget: Big(sbudget),
    ...r,
  };
}
