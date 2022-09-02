import SignIn from "../../src/components/SignIn";
import { getCsrfToken } from "next-auth/react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";

const LoginPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken }) => {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <SignIn csrfToken={csrfToken} />
    </>
  );
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps<{
  csrfToken: string;
}> = async (context) => {
  return {
    props: {
      csrfToken: `${await getCsrfToken(context)}`,
    },
  };
};
