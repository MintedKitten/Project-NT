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
  GridRenderEditCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import {
  Alert,
  Backdrop,
  CircularProgress,
  InputBase,
  InputBaseProps,
  TextField,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { valFloat, valInteger } from "../../src/create/projects";
import { ObjectId } from "bson";
import {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useCallback,
  useState,
} from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useConfirmDialog } from "react-mui-confirm";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { parseInteger } from "../../src/local";
import { rowInt, rowCSVInt, rowCSVClass } from "../../src/create/equipments";
import { parse as parsecsv } from "papaparse";
import Space from "../../src/components/Space";
import Big from "big.js";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  equipmentsFindAll,
  equipmentsGroupFindOne,
  equipmentsGroupInt,
  equipmentsInt,
  getMongoClient,
} from "../../src/db";
import { editEquipmentGroupAndEquipments } from "../../src/edit/equipments";
import ProjectMenubar from "../../src/components/ProjectMenubar";
import { log } from "../../src/logger";
import { checkSession } from "../../src/server";

interface EditToolbarProps {
  setRows: (
    newRows: (oldRows: GridRowsProp<rowInt>) => GridRowsProp<rowInt>
  ) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

/**
 * The equipment form toolbar element
 * @param props
 * @returns
 */
function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  /**
   * Add new empty equipment row
   */
  const handleClickAddOneEmptyRow = () => {
    const id = Math.random() + "";
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        eqid: new ObjectId(),
        partNumber: "",
        desc: "",
        uPrice: Big(0),
        qty: 0,
        unit: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "partNumber" },
    }));
  };

  /**
   * add new equipments from CSV
   * @param e
   * @returns
   */
  const handleAddMultipleFromCSV = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      alert("File select canceled");
      return;
    }
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        throw new Error("Can't read file");
      }
      const { result } = event.target;
      const parsedCSV = parsecsv<rowCSVInt>(result.toString(), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });
      try {
        const newRows = parsedCSV.data;
        const columns = parsedCSV.meta.fields as NonNullable<string[]>;
        const correctColumns = Object.keys(new rowCSVClass());
        const withIdNewRows: rowInt[] = [];
        const withIdModel: GridRowModesModel = {};
        newRows.forEach((nrow, rowindex) => {
          // Check Column
          correctColumns.forEach((rkey) => {
            if (!columns.find((element) => element === rkey)) {
              throw new Error("Column " + rkey + " is missing");
            }
          });
          columns.forEach((rkey) => {
            if (!correctColumns.find((element) => element === rkey)) {
              throw new Error("Unknown column " + rkey);
            }
          });
          // Check entries
          Object.entries(nrow).forEach(([key, value]) => {
            if (!value) {
              throw new Error(`row ${rowindex + 1} has empty on column ${key}`);
            }
            if (key === "qty") {
              try {
                parseInteger(value);
              } catch (err) {
                throw new Error(`row ${rowindex + 1} qty is not Integer`);
              }
            }
            if (key === "uPrice") {
              try {
                Big((value + "").replace(/,/g, "")).add(1);
              } catch (err) {
                throw new Error(`row ${rowindex + 1} uPrice is not Number`);
              }
            }
          });

          const id = Math.random() + "";
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
      } catch (err) {
        reader.abort();
        alert(err);
      }
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

const EditTextarea = (props: GridRenderEditCellParams<string>) => {
  const { id, field, value, colDef } = props;
  const [valueState, setValueState] = useState(value);
  const apiRef = useGridApiContext();

  const handleChange = useCallback<NonNullable<InputBaseProps["onChange"]>>(
    (event) => {
      const newValue = event.target.value;
      setValueState(newValue);
      apiRef.current.setEditCellValue(
        { id, field, value: newValue, debounceMs: 200 },
        event
      );
    },
    [apiRef, field, id]
  );

  return (
    <InputBase
      multiline
      value={valueState}
      sx={{
        textarea: { resize: "vertical" },
        width: colDef.computedWidth,
        height: "fit-content !important",
      }}
      onChange={handleChange}
    />
  );
};

const EditEquipmentsGroup: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, peqGroup, pequipments }) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const eqg = convBack(peqGroup);

  const [nameError, setNameError] = useState("");
  const [amountError, setAmountError] = useState("");

  const [success, setSuccess] = useState(false);

  const [rows, setRows] = useState<GridRowsProp<rowInt>>(
    pequipments.map((eqmt) => {
      const { unitPrice, ...r } = eqmt;
      return {
        ...r,
        id: Math.random() + "",
        uPrice: Big(unitPrice),
        eqid: eqg._id,
      };
    })
  );
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const [rowsPerPage, setRowsPerPage] = useState(10);

  /**
   * Handle when rows per page number is changed
   * @param pageSize
   */
  const handleChangeRowsPerPage = (pageSize: number) => {
    setRowsPerPage(pageSize);
  };

  /**
   * Handle when start editing a row
   * @param _params
   * @param event
   */
  const handleRowEditStart: GridEventListener<"rowEditStart"> = (
    _params: GridRowParams,
    event: MuiEvent<SyntheticEvent>
  ) => {
    event.defaultMuiPrevented = true;
  };

  /**
   * Handle when stop editing a row
   * @param _params
   * @param event
   */
  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    _params,
    event
  ) => {
    event.defaultMuiPrevented = true;
  };

  /**
   * Handle when clicking edit icon
   * @param id
   * @returns
   */
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  /**
   * Handle when clicking save icon
   * @param id
   * @returns
   */
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  /**
   * Handle when clicking delete icon
   * @param id
   * @returns
   */
  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  /**
   * Handle when clicking cancel icon
   * @param id
   * @returns
   */
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

  /**
   * Handle adding new equipment row to form
   * @param newRow
   * @returns
   */
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
      renderEditCell: (params) => {
        return <EditTextarea {...params} />;
      },
    },
    {
      field: "desc",
      headerName: "Description",
      flex: 1,
      minWidth: 300,
      editable: true,
      renderEditCell: (params) => {
        return <EditTextarea {...params} />;
      },
    },
    {
      field: "qty",
      headerName: "Qty.",
      type: "number",
      width: 100,
      editable: true,
      valueParser: (value) => {
        const qty = valInteger(value);
        return qty > 0 ? qty : 0;
      },
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
      editable: true,
      renderEditCell: (params) => {
        return <EditTextarea {...params} />;
      },
    },
    {
      field: "uPrice",
      headerName: "Unit Price (?????????)",
      type: "number",
      width: 165,
      editable: true,
      valueParser: (value) => {
        const upr = valFloat((value + "").replace(/,/g, ""));
        return !upr.lt(0) ? upr.toString() : "0";
      },
      valueFormatter: (params) => {
        const upr = valFloat((params.value + "").replace(/,/g, ""));
        return !upr.lt(0) ? upr.toNumber().toLocaleString() : "0";
      },
    },
    {
      field: "xPrice",
      headerName: "Extended Price (?????????)",
      type: "number",
      width: 200,
      editable: false,
      valueGetter: (params) => {
        const unitPrice = valFloat((params.row.uPrice + "").replace(/,/g, ""));
        const error =
          unitPrice.lte(0) || parseInteger(params.row.qty + "") <= 0;
        const xpr = unitPrice.mul(params.row.qty);
        return !xpr.lt(0) && !error ? xpr : Big(0);
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
              icon={
                <Tooltip title="Save Equipment" arrow>
                  <SaveIcon />
                </Tooltip>
              }
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={`${id.toString()}_cancel`}
              icon={
                <Tooltip title="Cancel Equipment" arrow>
                  <CancelIcon />
                </Tooltip>
              }
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
            icon={
              <Tooltip title="Save Change" arrow>
                <EditIcon />
              </Tooltip>
            }
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={`${id.toString()}_delete`}
            icon={
              <Tooltip title="Delete Change" arrow>
                <DeleteIcon />
              </Tooltip>
            }
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const openConfirmDialog = useConfirmDialog();

  /**
   * Handle submiting new equipments group and equipments
   * @param event
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const eqGroup = {
      name: data.get("name"),
      desc: data.get("desc"),
      qty: data.get("amount"),
    };
    Object.entries(rowModesModel).map(([, value]) => {
      if (value.mode === GridRowModes.Edit) {
        alert("Table has unsaved row. Save it or remove it.");
        return;
      }
    });
    let nameer = "";
    let qtyer = "";
    if (!eqGroup.name) {
      nameer = "Please, enter the name of the group";
    }
    if (!eqGroup.qty) {
      qtyer = "Please, enter an amount";
    } else {
      try {
        const temp = parseInteger(eqGroup.qty + "");
        if (temp < 1) {
          qtyer = "Amount can't be less than 1";
        }
      } catch (err) {
        qtyer = "Please, enter a whole number";
      }
    }
    setNameError(nameer);
    setAmountError(qtyer);
    const isValid = nameer === "" && qtyer === "";
    if (isValid) {
      openConfirmDialog({
        title: "Are you sure you want to save equipment group?",
        onConfirm: async () => {
          const isSuccessful = await editEquipmentGroupAndEquipments(
            pid,
            eqg._id?.toHexString() + "",
            eqGroup.name + "",
            eqGroup.desc + "",
            parseInteger(eqGroup.qty + ""),
            rows
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
        confirmButtonText: "Save",
      });
    }
  };

  /**
   * Authentication: Redirect if not authenticated
   */
  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Update Project Equipments</title>
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
              Equipment Group Saved. Redirecting...
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
                Save Equipment Group
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex" }}>
                <TextField
                  name="name"
                  label="Group Name"
                  required
                  defaultValue={eqg.name}
                  error={nameError !== ""}
                  helperText={nameError}
                />
                <Space size={10} direction="column" />
                <TextField
                  name="amount"
                  label="Amount"
                  type="number"
                  required
                  defaultValue={eqg.qty}
                  error={amountError !== ""}
                  helperText={amountError}
                />
              </Box>
              <Space size={10} direction="row" />
              <TextField
                name="desc"
                label="Group Description"
                defaultValue={eqg.desc}
                fullWidth
              />
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
              "& .MuiDataGrid-viewport, .MuiDataGrid-row, .MuiDataGrid-renderingZone":
                {
                  maxHeight: "fit-content !important",
                },
              "& .MuiDataGrid-cell": {
                maxHeight: "fit-content !important",
                overflow: "auto",
                whiteSpace: "initial !important",
                lineHeight: "16px !important",
                display: "flex !important",
                alignItems: "center",
                paddingTop: "10px !important",
                paddingBottom: "10px !important",
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

export default EditEquipmentsGroup;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  peqGroup: ReturnType<typeof convtoSerializable>;
  pequipments: Omit<equipmentsInt, "projId" | "eqgId" | "_id">[];
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
    msg: "Edit project equipments page was queried",
    url: "edit/equipments",
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
  if (!webquery["eqgid"]) {
    return {
      redirect: {
        destination: "/home/status",
        permanent: false,
      },
    };
  }
  let retOb: GetServerSidePropsResult<{
    pid: string;
    peqGroup: ReturnType<typeof convtoSerializable>;
    pequipments: Omit<equipmentsInt, "projId" | "eqgId" | "_id">[];
  }> = {
    redirect: {
      destination: "/home/status",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const presult = await equipmentsGroupFindOne(conn, {
      _id: new ObjectId(webquery["eqgid"] as string),
    });
    if (!presult) {
      retOb = {
        redirect: {
          destination: "/home/status",
          permanent: false,
        },
      };
    } else {
      const eqmts: Omit<equipmentsInt, "projId" | "eqgId" | "_id">[] =
        await equipmentsFindAll(
          conn,
          { eqgId: presult._id },
          { projection: { projId: 0, eqgId: 0, _id: 0 } }
        );
      const eqgSer = convtoSerializable(presult);
      retOb = {
        props: {
          pid: webquery["pid"] as string,
          peqGroup: eqgSer,
          pequipments: eqmts,
        },
      };
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
function convtoSerializable(data: equipmentsGroupInt) {
  const { _id, projId, ...r } = data;
  return {
    _id: _id?.toHexString(),
    projId: projId.toHexString(),
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
): equipmentsGroupInt {
  const { _id: s_id, projId: sprojId, ...r } = data;
  return {
    _id: new ObjectId(s_id),
    projId: new ObjectId(sprojId),
    ...r,
  };
}
