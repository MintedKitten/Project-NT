import SignIn from "../../src/components/SignIn";
import { getCsrfToken } from "next-auth/react";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

const LoginPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken }) => {
  return <SignIn csrfToken={csrfToken} />;
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
