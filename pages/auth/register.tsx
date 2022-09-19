import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import SignUp from "../../src/components/SignUp";
import { log } from "../../src/logger";

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Register - To Be Removed</title>
      </Head>
      <SignUp />
    </>
  );
};

export default LoginPage;

/**
 * Just for logging. No actual function
 * @param context
 * @returns
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const toLog = {
    msg: "Sign up page was queried",
    url: "auth/register",
    query: context.query,
  };
  log(JSON.stringify(toLog));
  return { props: {} };
};
