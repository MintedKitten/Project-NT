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

export async function 