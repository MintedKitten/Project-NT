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
import { Alert, TextField, useMediaQuery } from "@mui/material";
import { isMobile } from "react-device-detect";
import { valFloat, valInteger } from "../../src/create/projects";
import { ObjectId } from "bson";
import { ChangeEvent, useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useConfirmDialog } from "react-mui-confirm";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { navInfo, projectNavInfo } from "../../src/local";
import {
  rowInt,
  rowCSVInt,
  addEquipmentGroupAndEquipments,
} from "../../src/create/equipments";
import { parse as parsecsv } from "papaparse";
import Space from "../../src/components/Space";
import Big from "big.js";

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
        uPrice: Big(0),
        qty: 0,
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "partNumber" },
    }));
  };

  const handleAddMultipleFromCSV = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      alert("File select canceled");
      return;
    }
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        alert("Can't read file");
        return;
      }
      const { result } = event.target;
      const parsedCSV = parsecsv<rowCSVInt>(result.toString(), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      const newRows = parsedCSV.data;
      const withIdNewRows: rowInt[] = [];
      const withIdModel: GridRowModesModel = {};
      newRows.forEach((nrow) => {
        const id = randomId();
        const { uPrice, ...r } = nrow;
        withIdNewRows.push({
          ...r,
          uPrice: Big((uPrice + "").replace(/,/g, "")),
          id: id,
          isNew: false,
          isToSave: true,
          eqid: new ObjectId(),
        });
        withIdModel[id] = {
          mode: GridRowModes.View,
        };
      });

      setRows((oldRows) => {
        return [...oldRows, ...withIdNewRows];
      });
      setRowModesModel((oldModel) => {
        return { ...oldModel, ...withIdModel };
      });
    };
    reader.readAsText(file);
  };

  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickAddOneEmptyRow}
      >
        Add New Equipment
      </Button>
      <Space size={10} direction="column" />
      <Button color="primary" startIcon={<AddIcon />} component="label">
        Import from CSV
        <input
          type="file"
          hidden
          accept=".csv, text/csv"
          onChange={handleAddMultipleFromCSV}
        />
      </Button>
      <Space size={10} direction="column" />
      <Button
        component="a"
        download
        size="small"
        href="/equipments_template_with_header.csv"
        variant="outlined"
      >
        Get CSV Template
      </Button>
    </GridToolbarContainer>
  );
}

const CreateEquipmentsGroup = () => {
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const session = useSession();
  const router = useRouter();
  const pid = router.query.pid as string;
  const { status, data } = session;

  const [nameError, setNameError] = useState("");
  const [amountError, setAmountError] = useState("");

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
      minWidth: 300,
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
        const upr = valFloat((params.row.uPrice + "").replace(/,/g, ""));
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
        const xpr = valFloat((params.row.uPrice + "").replace(/,/g, "")).mul(
          params.row.qty
        );
        return !xpr.lt(0) ? xpr : Big(0);
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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const eqGroup = {
      name: data.get("name"),
      desc: data.get("desc"),
      qty: data.get("amount"),
    };
    let isFilled = true;
    if (!eqGroup.name) {
      setNameError("Please, enter the name of the group");
      isFilled = false;
    } else {
      setNameError("");
    }
    if (!eqGroup.qty) {
      setAmountError("Please, enter the amount");
      isFilled = false;
    } else {
      try {
        const am = parseInt((eqGroup.qty + "").replace(/./g, ""));
        setAmountError("");
      } catch (err) {
        setAmountError("Please, enter a whole number");
        isFilled = false;
      }
    }
    if (isFilled) {
      openConfirmDialog({
        title: "Are you sure you want to add new equipment group?",
        onConfirm: async () => {
          console.log(eqGroup);
          const rowsToUpdate: rowInt[] = [];
          rows.forEach((row) => {
            if (row.isToSave) {
              rowsToUpdate.push(row);
            }
          });
          console.log(rowsToUpdate);
          const isSuccessful = await addEquipmentGroupAndEquipments(
            pid,
            eqGroup.name + "",
            eqGroup.desc + "",
            parseInt(eqGroup.qty + ""),
            rowsToUpdate
          );
          if (isSuccessful) {
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
    }
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
          <Box component={"form"} noValidate onSubmit={handleSubmit}>
            <Box sx={{ display: "flex" }}>
              <Button
                className="titleButton"
                variant="contained"
                startIcon={<SaveIcon />}
                type="submit"
              >
                Add Equipment Group
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex" }}>
                <TextField
                  name="name"
                  label="Group Name"
                  required
                  error={nameError !== ""}
                  helperText={nameError}
                />
                <Space size={10} direction="column" />
                <TextField
                  name="amount"
                  label="Amount"
                  type="number"
                  required
                  error={amountError !== ""}
                  helperText={amountError}
                />
              </Box>
              <Space size={10} direction="row" />
              <TextField name="desc" label="Group Description" fullWidth />
            </Box>
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
          </Box>
        </PageContainer>
      </>
    );
  }
};

export default CreateEquipmentsGroup;
