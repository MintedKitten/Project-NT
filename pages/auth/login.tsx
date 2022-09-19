import SignIn from "../../src/components/SignIn";
import { getCsrfToken } from "next-auth/react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { log } from "../../src/logger";

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

/**
 * Just for logging. No actual function
 * @param context 
 * @returns 
 */
export const getServerSideProps: GetServerSideProps<{
  csrfToken: string;
}> = async (context) => {
  const toLog = {
    msg: "Sign in page was queried",
    url: "auth/login",
    query: context.query,
  };
  log(JSON.stringify(toLog));
  return {
    props: {
      csrfToken: `${await getCsrfToken(context)}`,
    },
  };
};
