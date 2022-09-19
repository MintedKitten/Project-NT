/**
 * @file Backend Auth functions
 */
import { authFindOne, authInsertOne, getMongoClient, sha256 } from "./db";
import seedrandom from "seedrandom";

/**
 * Hash password
 * @param username
 * @param password
 * @returns
 */
export function hashPassword(username: string, password: string) {
  const hashed = sha256(
    username +
      password +
      seedrandom(username + password + process.env.AUTH_SECRET)()
  );
  return hashed;
}

/**
 * Create a new user, admin field is unused.
 * @param username
 * @param password
 * @param name
 * @returns
 */
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
  await conn.close();
  return isComplete;
}

/**
 * Check if username has been used
 * @param username
 * @returns
 */
export async function isUsernameExist(username: string) {
  const query = { username: username };
  const conn = await getMongoClient();
  const isExist = await authFindOne(conn, query);
  await conn.close();
  return isExist ? true : false;
}

/**
 * Get user
 * @param username
 * @param password
 * @returns
 */
export async function getUser(username: string, password: string) {
  const query = { username: username, password: password };
  const conn = await getMongoClient();
  const user = await authFindOne(conn, query);
  await conn.close();
  return user;
}
