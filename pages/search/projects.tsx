import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
} from "@mui/material";
import {
  Search as SearchIcon,
  OpenInBrowser as OpenInBrowserIcon,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import Space from "../../src/components/Space";
import { typeArray } from "../../src/search/projects";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  getMongoClient,
  projectDistinct,
  projectFindAll,
  projectsInt,
} from "../../src/db";
import { ObjectId } from "bson";
import { navInfo } from "../../src/local";
import { getToken } from "next-auth/jwt";

const SearchProjectsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ result, filterSelectionYear }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const typeArr = [1, 2, 3];

  const calcOpacity = (r: number) => {
    return r === 0 ? 0.5 : 1;
  };

  const [filteryear, setFilteryear] = useState(
    parseInt(router.query.year ? "" + router.query.year : "0")
  );
  const [filtertype, setFiltertype] = useState(
    parseInt(router.query.type ? "" + router.query.type : "0")
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const searchData = {
      name: data.get("projectname"),
      type: data.get("typeselect"),
      year: data.get("yearselect"),
    };
    router.push({
      pathname: "/search/projects",
      query: {
        name: "" + searchData.name,
        type: "" + searchData.type,
        year: "" + searchData.year,
      },
    });
  };

  const handleYearChange = (event: SelectChangeEvent) => {
    let selectYear = event.target.value;
    if (selectYear === "All") {
      setFilteryear(0);
    }
    setFilteryear(parseInt(selectYear));
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    let selectType = event.target.value;
    setFiltertype(parseInt(selectType));
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
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
    return (
      <>
        <Head>
          <title>Search Projects</title>
        </Head>
        <PageAppbar session={data}>
          <PageNavbar navlink={navInfo} session={data} />
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
            <InputLabel id="labelSearchName">Project Name</InputLabel>
            <TextField
              margin="dense"
              fullWidth
              id="projectname"
              name="projectname"
            />
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "50%" }}
              >
                <InputLabel id="labelSelectYear">Year</InputLabel>
                <Select
                  labelId="labelSelectYear"
                  id="yearselect"
                  name="yearselect"
                  value={filteryear === 0 ? 0 + "" : filteryear + ""}
                  sx={{ opacity: calcOpacity(filteryear) }}
                  onChange={(event: SelectChangeEvent) => {
                    handleYearChange(event);
                  }}
                >
                  <MenuItem value={0} sx={{ opacity: 0.5 }}>
                    <b>All</b>
                  </MenuItem>
                  {filterSelectionYear.map((yu) => {
                    return (
                      <MenuItem key={yu} value={yu}>
                        {/* Convert to buddhist year */}
                        {yu + 543}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Box>
              <Space size={15} direction="column" />
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "50%" }}
              >
                <InputLabel id="labelSelectType">Type</InputLabel>
                <Select
                  labelId="labelSelectType"
                  id="typeselect"
                  name="typeselect"
                  fullWidth
                  value={filtertype === 0 ? 0 + "" : filtertype + ""}
                  sx={{ opacity: calcOpacity(filtertype), width: "100%" }}
                  onChange={(event: SelectChangeEvent) => {
                    handleTypeChange(event);
                  }}
                >
                  <MenuItem value={0} sx={{ opacity: 0.5 }}>
                    <b>All</b>
                  </MenuItem>
                  {typeArr.map((tu) => (
                    <MenuItem key={tu} value={tu}>
                      {typeArray[tu]}
                    </MenuItem>
                  ))}
                </Select>
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
                  <TableCell>รายการโครงการจัดซื้อจัดจ้าง</TableCell>
                  <TableCell align="center">ประเภทโครงการ</TableCell>
                  <TableCell align="center">
                    ปีที่ดำเนินการจัดซื้อจัดจ้าง
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const { id, name, type, year } = row;
                    return (
                      <TableRow hover key={index}>
                        <TableCell scope="row" sx={{ cursor: "pointer" }}>
                          <Link
                            href={{
                              pathname: "/project/projects",
                              query: { pid: id },
                            }}
                            passHref
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                event.preventDefault();
                                window.open(
                                  "/project/projects?pid=" + id,
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
                                {name}
                                <Tooltip title="Open Project" arrow>
                                  <OpenInBrowserIcon fontSize="small" />
                                </Tooltip>
                              </Typography>
                            </a>
                          </Link>
                        </TableCell>
                        <TableCell align="center" scope="row">
                          <Typography>{typeArray[type]}</Typography>
                        </TableCell>
                        <TableCell align="center" scope="row">
                          {/* Convert to buddhist year */}
                          <Typography>{year + 543}</Typography>
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

export default SearchProjectsPage;

export const getServerSideProps: GetServerSideProps<{
  result: ReturnType<typeof convtoTable>[];
  filterSelectionYear: number[];
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
  const query: { [key in keyof projectsInt]?: any } = {};
  if (webquery["name"]) {
    query["projName"] = new RegExp(".*" + webquery["name"] + ".*");
  }
  if (webquery["type"] && webquery["type"] !== "0") {
    query["type"] = parseInt(webquery["type"]);
  }
  if (webquery["year"] && webquery["year"] !== "0") {
    query["procurementYear"] = parseInt(webquery["year"]);
  }
  let retOb: GetServerSidePropsResult<{
    result: ReturnType<typeof convtoTable>[];
    filterSelectionYear: number[];
  }> = {
    redirect: {
      destination: "/home/alert",
      permanent: false,
    },
  };
  const conn = await getMongoClient();
  try {
    const presult = await projectFindAll(conn, query, {
      projection: {
        projName: 1,
        type: 1,
        procurementYear: 1,
      },
    });
    const pyear = await projectDistinct(conn, "procurementYear", {});
    const convresult = presult.map((res) => {
      return convtoTable(res);
    });
    retOb = {
      props: {
        result: convresult,
        filterSelectionYear: pyear as number[],
      },
    };
  } catch (err) {
    console.log(err);
  } finally {
    await conn.close();
    return retOb;
  }
};

function convtoTable(data: projectsInt) {
  return {
    id: (data._id as ObjectId).toHexString(),
    name: data.projName,
    type: data.type,
    year: data.procurementYear,
  };
}
