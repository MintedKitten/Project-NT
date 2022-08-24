import {
  authFindOne,
  authInsertOne,
  getMongoClient,
  sha256,
  userInt,
} from "./db";
import seedrandom from "seedrandom";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
            return { id: user._id, name: user.name, admin: user.admin };
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
  secret: `${process.env.NEXTAUTH_SECRET}`,
  jwt: { secret: `${process.env.NEXTAUTH_SECRET}` },
  pages: { signIn: "/auth/login" },
};

export function hashPassword(username: string, password: string) {
  const hashed = sha256(
    username + password + seedrandom(username + password + process.env.secret)()
  );
  return hashed;
}

export async function createNewUser(
  username: string,
  password: string,
  name: string
) {
  const query = {
    username: username,
    password: password,
    admin: true,
    name: name,
  };
  const conn = await getMongoClient();
  const isComplete = await authInsertOne(conn, query);
  conn.close();
  return isComplete;
}

export async function isUsernameExist(username: string) {
  const query = { username: username };
  const conn = await getMongoClient();
  const isExist = await authFindOne(conn, query);
  conn.close();
  return isExist ? true : false;
}

export async function getUser(username: string, password: string) {
  const query = { username: username, password: password };
  const conn = await getMongoClient();
  const user = await authFindOne(conn, query);
  conn.close();
  return user;
}
