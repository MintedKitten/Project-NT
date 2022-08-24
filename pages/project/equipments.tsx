import type { NextPage } from "next";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const ProjectEquipmentsPage: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
  }

//   if (status === "authenticated") {
//     router.push({ pathname: "/search/projects" }, "/search/projects");
//   }
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
