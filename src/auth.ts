import { authFindOne, getMongoClient } from "./db";

export interface userprofiletokenInt {
  userId: number | null;
  sub: number | null;
  iat: number | null;
  profile: userprofileInt | null;
}

export interface userprofileInt {
  username: string;
}

export async function isUsernameExist(username: string) {
  const query = { username: username };
  const conn = await getMongoClient();
  const isExist = await authFindOne(conn, query);
  if (isExist) {
    return true;
  } else {
    return false;
  }
}
