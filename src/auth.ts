import { authFindOne, authInsertOne, getMongoClient, sha256 } from "./db";
import seedrandom from "seedrandom";

export interface userprofiletokenInt {
  userId: number | null;
  sub: number | null;
  iat: number | null;
  profile: userprofileInt | null;
}

export interface userprofileInt {
  username: string;
}

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
