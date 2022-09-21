import SignIn from "../../src/components/SignIn";
import { getCsrfToken } from "next-auth/react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import { log } from "../../src/logger";
import { encode } from "next-auth/jwt";
import { sign } from "jsonwebtoken";

const LoginPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, enctoken }) => {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <SignIn csrfToken={csrfToken} encToken={enctoken} />
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
  enctoken: string;
}> = async (context) => {
  const toLog = {
    msg: "Sign in page was queried",
    url: "auth/login",
    query: context.query,
  };
  const date = new Date();
  log(JSON.stringify(toLog), "info", date);
  const token = {
    enc: Math.random() + "",
    date: date.toString(),
  };
  const jwtenc = sign(token, Math.random() + "");
  return {
    props: {
      csrfToken: `${await getCsrfToken(context)}`,
      enctoken: jwtenc,
    },
  };
};
