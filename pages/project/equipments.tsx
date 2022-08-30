import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getMongoClient } from "../../src/db";
import Head from "next/head";

import PageAppbar from "../../src/components/PageAppbar";
import PageContainer from "../../src/components/PageContainer";
import PageNavbar from "../../src/components/PageNavbar";
import ProjectNavbar from "../../src/components/ProjectNavbar";
import { navInfo, projectNavInfo } from "../../src/local";
import { getToken } from "next-auth/jwt";
import Link from "next/link";

const ProjectEquipmentsPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pid }) => {
  const session = useSession();
  const router = useRouter();
  const { status, data } = session;

  const TitleButtonElement = () => {
    return (
      <Link href={{ pathname: "/create/equipments", query: { pid: pid } }}>
        <Button
          className="titleButton"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {}}
        >
          Add New Equipments Group
        </Button>
      </Link>
    );
  };

  if (status === "unauthenticated") {
    router.push({ pathname: "/api/auth/signin" });
  }

  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Project Equipments</title>
        </Head>
        <PageAppbar>
          <PageNavbar navlink={navInfo} currentTab={-1} session={data} />
          <ProjectNavbar
            navlink={projectNavInfo}
            currentTab={"Equipments"}
            pid={pid}
          />
        </PageAppbar>

        <PageContainer>
          <Box>
            <Box className="filler" sx={{ flexGrow: 1 }} />
            <TitleButtonElement />
          </Box>
          <Box></Box>
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

export default ProjectEquipmentsPage;

export const getServerSideProps: GetServerSideProps<{
  pid: string;
  // preresult: ReturnType<typeof convtoSerializable>;
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
  if (!webquery["pid"]) {
    return {
      redirect: {
        destination: "/search/projects",
        permanent: false,
      },
    };
  }
  const conn = await getMongoClient();
  await conn.close();
  return { props: { pid: webquery.pid as string } };
};
