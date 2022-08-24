import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthenticateFromCredentials } from "../../../src/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        if (credentials) {
          const username = credentials.username;
          const password = credentials.password;
          const user = await AuthenticateFromCredentials({
            username: username,
            password: password,
          });
          if (user) {
            return { id: 12345, name: "ABCDEF" };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.id = token.id;
      }
      return session;
    },
  },
  secret: `${process.env.secret}`,
  jwt: { secret: `${process.env.secret}` },
  pages: { signIn: "/auth/login" },
};

const nxauth = NextAuth(authOptions);

export default nxauth;
