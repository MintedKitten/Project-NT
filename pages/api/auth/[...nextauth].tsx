import { decode } from "jsonwebtoken";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUser, hashPassword } from "../../../src/auth";
import { log } from "../../../src/logger";

/**
 * NextAuth Configuration Option
 * Using Credential i.e. With username and password
 */
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
          const passwordToken = decode(credentials.password) as {
            password: string;
            sub: string;
            date: string;
          };
          const user = await getUser(
            username,
            hashPassword(username, passwordToken.password)
          );
          if (user) {
            const toLog = {
              msg: "A log in attempt was successful",
              uid: user._id,
              user: user.name,
              rawheader: req.headers,
              pwdToken: { sub: passwordToken.sub, date: passwordToken.date },
            };
            log(JSON.stringify(toLog));
            return { id: user._id, name: user.name };
          }
        }
        const toLog = {
          msg: "A log in attempt was unsuccessful",
          rawheader: req.headers,
        };
        log(JSON.stringify(toLog));
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
  secret: `${process.env.NEXTAUTH_SECRET}`,
  jwt: { secret: `${process.env.JWT_SECRET}` },
  pages: { signIn: "/auth/login" },
};

/**
 * The handler
 */
const nxauth = NextAuth(authOptions);

export default nxauth;
