import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import Space from "../../src/components/Space";
import { navInfo } from "../../src/local";
import { Search as SearchIcon } from "@mui/icons-material";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";

const SearchEquipmentsPage = () => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const result = [];

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
        qty: data.get("qty"),
        unitPricelb: data.get("unitPricelb"),
        unitPriceub: data.get("unitPriceub"),
      };
      router.push({
        pathname: "/search/equipments",
        query: {
          partNumber: searchData.partNumber + "",
          desc: searchData.desc + "",
          qty: searchData.qty + "",
          unitPricelb: searchData.unitPricelb + "",
          unitPriceub: searchData.unitPriceub + "",
        },
      });
    };

    return (
      <>
        <Head>
          <title>Search Projects</title>
        </Head>
        <PageAppbar>
          <PageNavbar navlink={navInfo} currentTab={1} session={data} />
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
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              <Box sx={{ width: { xs: "50%", sm: "30%" } }}>
                <InputLabel id="labelSearchName">Part Number</InputLabel>
                <TextField
                  margin="dense"
                  fullWidth
                  id="partNumber"
                  name="partNumber"
                />
              </Box>
              <Space size={15} direction="column" />
              <Box sx={{ width: { xs: "50%", sm: "70%" } }}>
                <InputLabel id="labelSearchName">Description</InputLabel>
                <TextField margin="dense" fullWidth id="desc" name="desc" />
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              <Box sx={{ width: "40%" }}>
                <InputLabel id="labelSearchName">Qty</InputLabel>
                <TextField margin="dense" fullWidth id="qty" name="qty" />
              </Box>
              <Space size={15} direction="column" />
              <Box sx={{ width: "60%" }}>
                <InputLabel id="labelSearchName">Unit Price</InputLabel>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    margin="dense"
                    fullWidth
                    id="unitPricelb"
                    name="unitPricelb"
                    type="number"
                    label="From"
                  />
                  <Space size={10} direction="column" />
                  <TextField
                    margin="dense"
                    fullWidth
                    id="unitPriceub"
                    name="unitPriceub"
                    type="number"
                    label="To"
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

export const getServerSideProps: GetServerSideProps = async (context) => {
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
  return { props: {} };
};
