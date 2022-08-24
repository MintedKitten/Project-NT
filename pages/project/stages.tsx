import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next";
import { Backdrop, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getMongoClient } from "../../src/db";
import Head from "next/head";
import { pid } from "process";
import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";

const ProjectStagesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  if (status === "unauthenticated") {
    router.push("/api/auth/signin");
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Details</title>
        </Head>
        <PageAppbar>
          <PageNavbar
            navlink={[
              { Header: "Search Project", Link: "/search/projects" },
              { Header: "Search Equipments", Link: "/search/equipments" },
              { Header: "Add New Project", Link: "/create/projects" },
            ]}
            currentTab={"Project"}
            session={data}
          />
          <ProjectNavbar
            navlink={[
              { Header: "Details", Link: "/project/projects" },
              { Header: "Files", Link: "/project/files" },
              { Header: "Equipments", Link: "/project/equipments" },
              { Header: "Stages", Link: "/project/stages" },
            ]}
            currentTab={"Stages"}
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

export default ProjectStagesPage;

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
