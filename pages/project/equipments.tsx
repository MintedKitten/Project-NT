import type {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  equipmentsFindAll,
  equipmentsGroupFindAll,
  equipmentsGroupInt,
  equipmentsInt,
  getMongoClient,
} from "../../src/db";
import Head from "next/head";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { getToken } from "next-auth/jwt";
import Link from "next/link";
import { ObjectId } from "bson";
import Big from "big.js";
import {
  GridColumns,
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { valFloat } from "../../src/create/projects";
import { useState } from "react";
import { equipmentsGroupDelete } from "../../src/edit/equipments";
import { useConfirmDialog } from "react-mui-confirm";
import ProjectMenubar from "../../src/components/ProjectMenubar";

const ProjectEquipmentsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid, peqGroups, pequipments }) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangeRowsPerPage = (pageSize: number) => {
    setRowsPerPage(pageSize);
  };

  const eqGroups = peqGroups.map((eqg) => {
    return convBack(eqg);
  });

  const totals: Big[] = [];

  let totalxPrice = Big(0);
  pequipments.forEach((eqmts) => {
    let total = Big(0);
    eqmts.forEach((eqmt) => {
      total = total.plus(Big(eqmt.unitPrice).mul(eqmt.qty));
    });
    totals.push(total);
    totalxPrice = totalxPrice.plus(total);
  });

  const TitleButtonElement = () => {
    return (
      <Link href={{ pathname: "/create/equipments", query: { pid: pid } }}>
        <Button
          className="titleButton"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {}}
        >
          Add New Equipments Group
        </Button>
      </Link>
    );
  };

  const openConfirmDialog = useConfirmDialog();
  const handleDelete = (name: string, eqgid: string) => {
    openConfirmDialog({
      title: "Are you sure you want to delete: " + name + " ?",
      onConfirm: async () => {
        const isDeleteSuccessful = await equipmentsGroupDelete(eqgid);
        if (isDeleteSuccessful) {
          setTimeout(() => {
            router.push({
              pathname: "/project/equipments",
              query: { pid: pid },
            });
          }, 10);
        }
      },
      cancelButtonProps: {
        color: "primary",
      },
      confirmButtonProps: {
        color: "warning",
      },
      confirmButtonText: "Delete",
    });
  };

  const columns: GridColumns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      width: 150,
      editable: false,
    },
    {
      field: "desc",
      headerName: "Description",
      flex: 1,
      minWidth: 300,
      editable: false,
    },
    {
      field: "qty",
      headerName: "Qty.",
      type: "number",
      width: 100,
      editable: false,
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
      editable: false,
    },
    {
      field: "uPrice",
      headerName: "Unit Price (บาท)",
      type: "number",
      width: 165,
      editable: false,
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
      </GridToolbarContainer>
    );
  }

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Equipments</title>
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
          <Box>
            <Box className="filler" sx={{ flexGrow: 1 }} />
            <TitleButtonElement />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex" }}>
                  <Typography>{`Total Extended Price: ${totalxPrice
                    .toNumber()
                    .toLocaleString()} บาท`}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex" }}>
                  <Typography>{`+VAT: ${totalxPrice
                    .mul(1.07)
                    .toNumber()
                    .toLocaleString()} บาท`}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mt: 1 }}>
            {eqGroups.map((eqg, index) => {
              const { desc, name, qty, _id } = eqg;
              const equipments = pequipments[index].map((eqmt) => {
                const { unitPrice, _id: e_id, ...r } = eqmt;
                return { ...r, id: e_id, uPrice: unitPrice };
              });
              return (
                <Accordion key={name} TransitionProps={{ unmountOnExit: true }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", width: "100%" }}>
                      <Typography>{`${name}`}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography>{`${qty} จำนวน | ${totals[index]
                        .toNumber()
                        .toLocaleString()} บาท`}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography>{`${desc}`}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Button
                        variant="contained"
                        color="warning"
                        sx={{ mr: 1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(name, _id?.toHexString() + "");
                        }}
                      >
                        Delete
                      </Button>
                      <Link
                        href={{
                          pathname: "/edit/equipments",
                          query: { pid: pid, eqgid: _id?.toHexString() },
                        }}
                      >
                        <Button variant="contained">Edit</Button>
                      </Link>
                    </Box>
                    <Box sx={{ height: "60vh", mt: 1 }}>
                      <DataGrid
                        rows={equipments}
                        columns={columns}
                        pageSize={rowsPerPage}
                        onPageSizeChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 20, 50]}
                        disableColumnSelector
                        components={{ Toolbar: CustomToolbar }}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })}
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

export default ProjectEquipmentsPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  peqGroups: ReturnType<typeof convToSerializable>[];
  pequipments: (Omit<equipmentsInt, "projId" | "eqgId" | "_id"> & {
    _id: string;
  })[][];
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
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/home/alert",
        permanent: false,
      },
    };
  }
  let retOb: GetServerSidePropsResult<{
    pid: string;
    peqGroups: ReturnType<typeof convToSerializable>[];
    pequipments: (Omit<equipmentsInt, "projId" | "eqgId" | "_id"> & {
      _id: string;
    })[][];
  }> = {
    redirect: {
      destination: "/home/alert",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const pid = new ObjectId(webquery["pid"]);
    const eqGroups = await equipmentsGroupFindAll(conn, { projId: pid });
    eqGroups.sort((a, b) => {
      return a.order < b.order ? -1 : 1;
    });
    const eqmtsArray: (Omit<equipmentsInt, "projId" | "eqgId" | "_id"> & {
      _id: string;
    })[][] = [];
    for (let index = 0; index < eqGroups.length; index++) {
      const eqg = eqGroups[index];
      const presult = await equipmentsFindAll(
        conn,
        { eqgId: eqg._id },
        { projection: { projId: 0, eqgId: 0 } }
      );
      const result = presult.map((pres) => {
        const { _id, ...r } = pres;
        return { ...r, _id: _id.toHexString() };
      });
      eqmtsArray.push(result);
    }
    const eqgSer = eqGroups.map((eqg) => {
      return convToSerializable(eqg);
    });
    retOb = {
      props: {
        pid: webquery.pid as string,
        peqGroups: eqgSer,
        pequipments: eqmtsArray,
      },
    };
  } catch (err) {
    retOb = {
      redirect: {
        destination: "/home/alert",
        permanent: false,
      },
    };
  } finally {
    await conn.close();
    return retOb;
  }
};

function convToSerializable(data: equipmentsGroupInt) {
  const { _id, projId, ...r } = data;
  return {
    _id: _id?.toHexString(),
    projId: projId.toHexString(),
    ...r,
  };
}

function convBack(
  data: ReturnType<typeof convToSerializable>
): equipmentsGroupInt {
  const { _id: s_id, projId: sprojId, ...r } = data;
  return {
    _id: new ObjectId(s_id),
    projId: new ObjectId(sprojId),
    ...r,
  };
}
