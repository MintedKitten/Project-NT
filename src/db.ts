import { ObjectId } from "bson";
import { createHash } from "crypto";
import { MongoClient } from "mongodb";

/**
 * SHA256 Hashing
 * @param msg the string to be hashed
 * @returns hashed string
 */
export function sha256(msg: string): string {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(msg);
  // hash the message
  const hashBuffer = createHash("sha256").update(msgBuffer).digest();
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
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
  name: string;
  admin: boolean;
}

export async function getMongoClient() {
  const conn = await new MongoClient(`${process.env.mongodbPath}`).connect();
  return conn;
}

async function getAuthColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<userInt>(`${process.env.userCollection}`);
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
      return value.acknowledged;
    });
  return result;
}

export interface itemObjectInt {
  amount: number;
  unit: string;
}

export interface projectsInt {
  _id?: ObjectId;
  รายการโครงการจัดซื้อจัดจ้าง: string;
  ประเภทโครงการ: number;
  จำนวนหน่วย: itemObjectInt;
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": number;
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": number;
  ประเภทงบประมาณ: string;
  ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist: number;
  วันเริ่มสัญญา_buddhist: Date;
  "MA (ระยะเวลารับประกัน)": itemObjectInt;
  "วันเริ่ม MA_buddhist": Date;
  "วันหมดอายุ MA_buddhist": Date;
  หมายเหตุ: string;
  createdby?: ObjectId;
  lastupdate?: Date;
}
