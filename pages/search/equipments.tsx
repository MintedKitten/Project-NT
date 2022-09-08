import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import Space from "../../src/components/Space";
import {
  Search as SearchIcon,
  OpenInBrowser as OpenInBrowserIcon,
} from "@mui/icons-material";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getToken } from "next-auth/jwt";
import { equipmentsInt, getMongoClient, projectsInt } from "../../src/db";
import { Condition, Filter } from "mongodb";
import { ObjectId } from "bson";
import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { EquipmentWithProjectName } from "../../src/server";
import PageMenubar from "../../src/components/PageMenubar";

const SearchEquipmentsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ presult }) => {
  const isNavbar = useMediaQuery("(min-width:900px)");
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const result = presult.map((pres) => {
    return convBack(pres);
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const searchData = {
        partNumber: data.get("partNumber"),
        desc: data.get("desc"),
        qtylb: data.get("qtylb"),
        qtyub: data.get("qtyub"),
        unitPricelb: data.get("unitPricelb"),
        unitPriceub: data.get("unitPriceub"),
      };
      router.push({
        pathname: "/search/equipments",
        query: {
          partNumber: searchData.partNumber + "",
          desc: searchData.desc + "",
          qtylb: searchData.qtylb + "",
          qtyub: searchData.qtyub + "",
          unitPricelb: searchData.unitPricelb + "",
          unitPriceub: searchData.unitPriceub + "",
        },
      });
    };

    return (
      <>
        <Head>
          <title>Search Equipments</title>
        </Head>
        <PageAppbar>
          {isNavbar ? (
            <PageNavbar session={data} />
          ) : (
            <PageMenubar session={data} />
          )}
        </PageAppbar>
        <PageContainer>
          <Box
            sx={{ display: "flex", flexDirection: "column" }}
            component="form"
            onSubmit={handleSearchSubmit}
            noValidate
          >
            <Typography variant="h6" sx={{ opacity: 0.5, height: "100%" }}>
              Filter
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: "30%" } }}>
                <InputLabel id="labelSearchName">Part Number</InputLabel>
                <TextField
                  margin="dense"
                  fullWidth
                  id="partNumber"
                  name="partNumber"
                />
              </Box>
              <Space size={15} direction="column" />
              <Box sx={{ width: { xs: "100%", sm: "70%" } }}>
                <InputLabel id="labelSearchName">Description</InputLabel>
                <TextField margin="dense" fullWidth id="desc" name="desc" />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                width: "100%",
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: "40%" } }}>
                <InputLabel id="labelSearchName">Qty</InputLabel>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    margin="dense"
                    fullWidth
                    id="qtylb"
                    name="qtylb"
                    type="number"
                    label="Lower Bound"
                  />
                  <Space size={10} direction="column" />
                  <TextField
                    margin="dense"
                    fullWidth
                    id="qtyub"
                    name="qtyub"
                    type="number"
                    label="Upper Bound"
                  />
                </Box>
              </Box>
              <Space size={15} direction="column" />
              <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
                <InputLabel id="labelSearchName">Unit Price</InputLabel>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    margin="dense"
                    fullWidth
                    id="unitPricelb"
                    name="unitPricelb"
                    type="number"
                    label="Lower Bound"
                  />
                  <Space size={10} direction="column" />
                  <TextField
                    margin="dense"
                    fullWidth
                    id="unitPriceub"
                    name="unitPriceub"
                    type="number"
                    label="Upper Bound"
                  />
                </Box>
              </Box>
            </Box>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{ mt: 3 }}
            >
              Search
            </Button>
          </Box>
          <Space size={25} direction="row" />
          <Typography>{`Found: ${result.length} result${
            result.length > 1 ? "s" : ""
          }`}</Typography>
          <TableContainer component={Paper}>
            <Table aria-label="result table">
              <TableHead color="secondary">
                <TableRow>
                  <TableCell align="left">
                    รายการโครงการจัดซื้อจัดจ้าง
                  </TableCell>
                  <TableCell align="left">Part Number</TableCell>
                  <TableCell align="left">Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="left">Unit</TableCell>
                  <TableCell align="right">Unit Price (บาท)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const {
                      desc,
                      partNumber,
                      projId,
                      qty,
                      unitPrice,
                      _id,
                      projName,
                      unit,
                    } = row;
                    return (
                      <TableRow hover key={index}>
                        <TableCell scope="row" sx={{ cursor: "pointer" }}>
                          <Link
                            href={{
                              pathname: "/project/projects",
                              query: { pid: projId.toHexString() },
                            }}
                            passHref
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                event.preventDefault();
                                window.open(
                                  "/project/projects?pid=" +
                                    projId.toHexString(),
                                  "_blank"
                                );
                              }}
                              style={{
                                font: "inherit",
                                color: "rgba(0, 0, 0, 0.87)",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                }}
                              >
                                {projName}
                                <Tooltip title="Open Project" arrow>
                                  <OpenInBrowserIcon fontSize="small" />
                                </Tooltip>
                              </Typography>
                            </a>
                          </Link>
                        </TableCell>
                        <TableCell scope="row">
                          <Typography>{partNumber}</Typography>
                        </TableCell>
                        <TableCell scope="row">
                          <Typography>{desc}</Typography>
                        </TableCell>
                        <TableCell align="right" scope="row">
                          <Typography>{qty}</Typography>
                        </TableCell>
                        <TableCell align="left" scope="row">
                          <Typography>{unit}</Typography>
                        </TableCell>
                        <TableCell align="right" scope="row">
                          <Typography>{unitPrice}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={result.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
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

export default SearchEquipmentsPage;

export const getServerSideProps: GetServerSideProps<{
  presult: ReturnType<typeof convToSerializable>[];
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
  const query: Filter<equipmentsInt> = {};
  let result: ReturnType<typeof convToSerializable>[] = [];
  const conn = await getMongoClient();
  try {
    if (webquery["partNumber"]) {
      query["partNumber"] = new RegExp(".*" + webquery["partNumber"] + ".*");
    }
    if (webquery["desc"]) {
      query["desc"] = new RegExp(".*" + webquery["desc"] + ".*");
    }
    let qqty = false;
    const qty: Condition<number> = {};
    if (webquery["qtylb"]) {
      qty["$gte"] = Number(webquery["qtylb"]);
      qqty = true;
    }
    if (webquery["qtyub"]) {
      qty["$lte"] = Number(webquery["qtyub"]);
      qqty = true;
    }
    if (qqty) {
      query["qty"] = qty;
    }
    let qup = false;
    const unitPrice: Condition<string> = { $and: [] };
    if (webquery["unitPricelb"]) {
      if (unitPrice["$and"]) {
        unitPrice["$and"].push({
          $expr: {
            $gte: [
              { $toDouble: "$unitPrice" },
              parseFloat(webquery["unitPricelb"]),
            ],
          },
        });
        qup = true;
      }
    }
    if (webquery["unitPriceub"]) {
      if (unitPrice["$and"]) {
        unitPrice["$and"].push({
          $expr: {
            $lte: [
              { $toDouble: "$unitPrice" },
              parseFloat(webquery["unitPriceub"]),
            ],
          },
        });
      }
      qup = true;
    }
    if (qup) {
      // @ts-ignore
      query["$and"] = unitPrice["$and"];
    }
    const cres = await EquipmentWithProjectName(conn, query);
    if (cres) {
      const presult = await cres.toArray();
      if (presult) {
        for (let index = 0; index < presult.length; index++) {
          const eqmt = presult[index];
          result.push(convToSerializable(eqmt));
        }
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    await conn.close();
    return { props: { presult: result } };
  }
};

function convToSerializable(data: Partial<equipmentsInt & projectsInt>) {
  const { _id, projId, ...r } = data;
  return {
    _id: _id?.toHexString(),
    partNumber: r.partNumber,
    desc: r.desc,
    qty: r.qty,
    unitPrice: r.unitPrice,
    projName: r.projName,
    projId: projId?.toHexString(),
    unit: r.unit,
  };
}

function convBack(data: ReturnType<typeof convToSerializable>) {
  const { _id: s_id, projId: sprojId, ...r } = data;
  return { _id: new ObjectId(s_id), projId: new ObjectId(sprojId), ...r };
}
