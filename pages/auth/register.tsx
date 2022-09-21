import { sign } from "jsonwebtoken";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Head from "next/head";
import SignUp from "../../src/components/SignUp";
import { log } from "../../src/logger";

const LoginPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ enctoken }) => {
  return (
    <>
      <Head>
        <title>Register - To Be Removed</title>
      </Head>
      <SignUp encToken={enctoken} />
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
  enctoken: string;
}> = async (context) => {
  const toLog = {
    msg: "Sign up page was queried",
    url: "auth/register",
    query: context.query,
  };
  const date = new Date();
  log(JSON.stringify(toLog), "info", date);
  const token = {
    enc: Math.random() + "",
    date: date.toString(),
  };
  const jwtenc = sign(token, Math.random() + "");
  return { props: { enctoken: jwtenc } };
};
