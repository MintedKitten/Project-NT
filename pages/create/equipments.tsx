import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColumns,
  GridRowParams,
  MuiEvent,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridCallbackDetails,
} from "@mui/x-data-grid";
import { randomId } from "@mui/x-data-grid-generator";
import { Alert, useMediaQuery } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ThaiAdapterDayjs } from "../../src/models/classDateAdapter";
import { isMobile } from "react-device-detect";
import { valFloat, valInteger } from "../../src/create/projects";
import { ObjectId } from "bson";
import { useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useConfirmDialog } from "react-mui-confirm";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { navInfo, projectNavInfo } from "../../src/local";
import { rowInt } from "../../src/create/equipments";

interface EditToolbarProps {
  setRows: (
    newRows: (oldRows: GridRowsProp<rowInt>) => GridRowsProp<rowInt>
  ) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClickAddOneEmptyRow = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        eqid: new ObjectId(),
        name: "",
        age: "",
        partNumber: "",
        desc: "",
        uPrice: 0,
        qty: 0,
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "partNumber" },
    }));
  };

  const handleAddMultipleFromCSV = () => {};

  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickAddOneEmptyRow}
      >
        Add New Equipment
      </Button>
    </GridToolbarContainer>
  );
}

const CreateEquipmentsGroup = () => {
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const session = useSession();
  const router = useRouter();
  const pid = router.query.pid;
  const { status, data } = session;

  const [success, setSuccess] = useState(false);

  const [rows, setRows] = useState<GridRowsProp<rowInt>>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangeRowsPerPage = (
    pageSize: number,
    event: GridCallbackDetails<any>
  ) => {
    setRowsPerPage(pageSize);
  };

  const handleRowEditStart = (
    params: GridRowParams,
    event: MuiEvent<React.SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel<rowInt>) => {
    const updatedRow = { ...newRow, isNew: false, isToSave: true };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const columns: GridColumns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      width: 150,
      editable: true,
    },
    {
      field: "desc",
      headerName: "Description",
      flex: 1,
      editable: true,
    },
    {
      field: "qty",
      headerName: "Qty.",
      type: "number",
      width: 100,
      editable: true,
      preProcessEditCellProps: (params) => {
        const hasError = valInteger(params.row.qty) === -1;
        return { ...params.props, error: hasError };
      },
      valueGetter: (params) => {
        const qty = valInteger(params.row.qty);
        return qty > 0 ? qty : 0;
      },
    },
    {
      field: "uPrice",
      headerName: "Unit Price (บาท)",
      type: "number",
      width: 165,
      editable: true,
      renderCell: (params) => {
        const upr = valFloat(params.row.uPrice);
        return !upr.lt(0) ? upr.toNumber().toLocaleString() : "0";
      },
    },
    {
      field: "xPrice",
      headerName: "Extended Price (บาท)",
      type: "number",
      width: 200,
      editable: false,
      valueGetter: (params) => {
        const xpr = valFloat(params.row.uPrice).mul(params.row.qty);
        return !xpr.lt(0) ? xpr.toNumber().toLocaleString() : "0";
      },
      renderCell: (params) => {
        const xpr = valFloat(params.row.uPrice).mul(params.row.qty);
        return !xpr.lt(0) ? xpr.toNumber().toLocaleString() : "0";
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`${id.toString()}_save`}
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={`${id.toString()}_cancel`}
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={`${id.toString()}_edit`}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={`${id.toString()}_delete`}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const openConfirmDialog = useConfirmDialog();
  const TitleButtonElement = () => {
    return (
      <Button
        className="titleButton"
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => {
          openConfirmDialog({
            title: "Are you sure you want to add new equipment group?",
            onConfirm: async () => {
              const rowsToUpdate: rowInt[] = [];
              rows.forEach((row) => {
                if (row.isToSave) {
                  rowsToUpdate.push(row);
                }
              });
              console.log(rowsToUpdate);
              // Add new Equipments Group
              if (true) {
                setSuccess(true);
                setTimeout(() => {
                  router.push({
                    pathname: "/project/equipments",
                    query: { pid: pid },
                  });
                }, 10);
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
        Add Equipment Group
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
          <title>Update Project</title>
        </Head>
        <PageAppbar>
          <PageNavbar navlink={navInfo} currentTab={-1} session={data} />
          <ProjectNavbar
            navlink={projectNavInfo}
            currentTab={false}
            pid={pid as string}
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
              New Equipment Group Added. Redirecting...
            </Alert>
          </Box>
          <Box sx={{ display: "flex" }}>
            <TitleButtonElement />
          </Box>
          <Box
            sx={{
              height: 500,
              mt: 1,
              width: "100%",
              "& .actions": {
                color: "text.secondary",
              },
              "& .textPrimary": {
                color: "text.primary",
              },
              "& .MuiDataGrid-row--editing .MuiDataGrid-cell--editing": {
                bgcolor: "#f0f9fc",
              },
              "& .MuiDataGrid-row--editing .grid-theme--NotEditable": {
                bgcolor: "#f0f9fc",
                "&:hover": {
                  bgcolor: "#adb2b8",
                },
              },
            }}
          >
            <LocalizationProvider
              dateAdapter={ThaiAdapterDayjs}
              dateFormats={{
                monthAndYear: "MMMM(MM) BBBB",
                monthShort: "MMM(MM)",
                year: "BBBB",
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStart={handleRowEditStart}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                components={{
                  Toolbar: EditToolbar,
                }}
                componentsProps={{
                  toolbar: { setRows, setRowModesModel },
                }}
                pageSize={rowsPerPage}
                onPageSizeChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
                experimentalFeatures={{ newEditingApi: true }}
                getCellClassName={(params) => {
                  return `grid-theme--${
                    params.isEditable || !["xPrice"].includes(params.field)
                      ? "Editable"
                      : "NotEditable"
                  }`;
                }}
                disableColumnSelector
              />
            </LocalizationProvider>
          </Box>
        </PageContainer>
      </>
    );
  }
};

export default CreateEquipmentsGroup;
