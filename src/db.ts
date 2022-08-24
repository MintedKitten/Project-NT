import { ObjectId } from "bson";
import { MongoClient } from "mongodb";

export interface fileMetadataInt {
  _id?: ObjectId;
  filename: string;
  filetype: string;
  contentType: string;
  size: number;
  uploadDate: Date;
  dir?: string;
}

export interface userInt {
  _id?: ObjectId;
  username: string;
  password: string;
}

export async function getMongoClient() {
  const conn = await new MongoClient(`${process.env.mongodbPath}`).connect();
  return conn;
}

async function getAuthColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<userInt>(`${process.env.authCollection}`);
  return coll;
}

export async function authFindOne(conn: MongoClient, query: Partial<userInt>) {
  const result = await (await getAuthColl(conn))
    .findOne(query)
    .then((value) => {
      return value;
    });
  return result;
}
export async function authInsertOne(conn: MongoClient, query: userInt) {
  const result = await (await getAuthColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.insertedId;
    });
  return result;
}
