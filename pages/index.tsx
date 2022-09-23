import type { GetServerSideProps, NextPage } from "next";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { log } from "../src/logger";
import { checkSession } from "../src/server";

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
    msg: "Home page was queried",
    url: "/",
    uid: session.id,
    user: session.user?.name,
    rawHeaders: context.req.rawHeaders,
    query: context.query,
  };
  log(JSON.stringify(toLog));
  return { props: {} };
};
