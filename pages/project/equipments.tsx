import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { Backdrop, CircularProgress, useMediaQuery } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getMongoClient } from "../../src/db";
import Head from "next/head";
import { pid } from "process";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { isMobile } from "react-device-detect";
import {  navInfo, projectNavInfo } from "../../src/local";

const ProjectEquipmentsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid }) => {
  const isDisplayMobile = useMediaQuery("(max-width:600px)") || isMobile;
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Details</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={navInfo}
            currentTab={-1}
            session={data}
          />
          <ProjectNavbar
            navlink={projectNavInfo}
            currentTab={"Equipments"}
            pid={pid}
          />
        </PageAppbar>

        <PageContainer></PageContainer>
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
  // preresult: ReturnType<typeof convtoSerializable>;
}> = async (context) => {
  const webquery = context.query as { [key: string]: any };
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/project/",
        permanent: false,
      },
    };
  }
  const conn = await getMongoClient();
  conn.close();
  // const presult = await projectFindOne(conn, {
  //   _id: new ObjectId(webquery["pid"] as string),
  // });
  // if (!presult) {
  //   return {
  //     redirect: {
  //       destination: "/search/projects",
  //       permanent: false,
  //     },
  //   };
  // } else {
  //   const conv = convtoSerializable(presult);
  return { props: { pid: webquery.pid as string } };
  // }
};
