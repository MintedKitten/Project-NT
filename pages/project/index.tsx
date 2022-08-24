import type { GetServerSideProps, NextPage } from "next";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const RedirectPage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
  }

  if (status === "authenticated") {
    router.push(
      {
        pathname: "/project/projects",
        query: { pid: sessionStorage.getItem("projectId") },
      },
      "/project/projects"
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

export default RedirectPage;
