import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUser, hashPassword } from "../../../src/auth";
import { sha256 } from "../../../src/db";
// import { AuthenticateFromCredentials } from "../../../src/db";

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
          const user = await getUser(
            username,
            hashPassword(username, password)
          );
          if (user) {
            return { id: user._id, name: "ABCDEF" };
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
