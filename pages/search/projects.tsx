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
  Typography,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import Space from "../../src/components/Space";
import { searchProjectsTableInt, typeArray } from "../../src/search/projects";

const SearchProjectsPage = () => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const typeArr = [1, 2, 3];

  const calcOpacity = (r: number) => {
    return r === 0 ? 0.5 : 1;
  };

  const [filterSelectionYear, setFilterSelectionYear] = useState<number[]>([]);

  const [filteryear, setFilteryear] = useState(
    parseInt(router.query.year ? "" + router.query.year : "0")
  );
  const [filtertype, setFiltertype] = useState(
    parseInt(router.query.type ? "" + router.query.type : "0")
  );

  const [result, setResult] = useState<searchProjectsTableInt[]>([]);

  const handleSearchSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const searchData = {
      name: data.get("projectname"),
      type: data.get("typeselect"),
      year: data.get("yearselect"),
    };
    router.push(
      {
        pathname: "/search/projects",
        query: {
          name: "" + searchData.name,
          type: "" + searchData.type,
          year: "" + searchData.year,
        },
      },
      "/search/projects"
    );
    // setResult()
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

  const queryData = useCallback(async () => {
    setResult([]);
    setFilterSelectionYear([]);
  }, []);

  useEffect(() => {
    queryData();
  }, [queryData]);

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Search Page</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={[
              { Header: "Search Project", Link: "/search/projects" },
              { Header: "Search Equipments", Link: "/search/equipments" },
              { Header: "Add New Project", Link: "/create/projects" },
            ]}
            currentTab={"Search Project"}
            session={data}
          />
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
              //   label="Project Name"
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
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Year</TableCell>
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
                            href={{ pathname: "/project/" + name }}
                            passHref
                          >
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                event.preventDefault();
                                window.open(
                                  "/project/" + id.toHexString(),
                                  "_blank"
                                );
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  textDecoration: "underline",
                                }}
                              >
                                {name}
                              </Typography>
                            </a>
                          </Link>
                        </TableCell>
                        <TableCell align="center" scope="row">
                          {typeArray[type]}
                        </TableCell>
                        <TableCell align="center" scope="row">
                          {/* Convert to buddhist year */}
                          {year + 543}
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
