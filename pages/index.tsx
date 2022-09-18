import type { GetServerSideProps, NextPage } from "next";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { log } from "../src/logger";

const HomePage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { status } = session;

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    router.push({ pathname: "/home/status" });
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

export default HomePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const toLog = {
    msg: "Home page was queried",
    url: "/",
    query: context.query,
  };
  log(JSON.stringify(toLog));
  return { props: {} };
};
