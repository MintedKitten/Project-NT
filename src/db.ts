import { ObjectId } from "bson";
import { createHash } from "crypto";
import { MongoClient, WithId } from "mongodb";
import { Big } from "big.js";
import { stageNames, StagesProgress } from "./local";

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
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": Big;
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": Big;
  ประเภทงบประมาณ: string;
  ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist: number;
  วันเริ่มสัญญา_buddhist: Date;
  "MA (ระยะเวลารับประกัน)": itemObjectInt;
  "วันเริ่ม MA_buddhist": Date;
  "วันหมดอายุ MA_buddhist": Date;
  หมายเหตุ: string;
  createdby: ObjectId;
  lastupdate: Date;
}

interface projectsInsertInt {
  _id?: ObjectId;
  รายการโครงการจัดซื้อจัดจ้าง: string;
  ประเภทโครงการ: number;
  จำนวนหน่วย: itemObjectInt;
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": string;
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": string;
  ประเภทงบประมาณ: string;
  ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist: number;
  วันเริ่มสัญญา_buddhist: Date;
  "MA (ระยะเวลารับประกัน)": itemObjectInt;
  "วันเริ่ม MA_buddhist": Date;
  "วันหมดอายุ MA_buddhist": Date;
  หมายเหตุ: string;
  createdby: ObjectId;
  lastupdate: Date;
}

async function getProjectColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<projectsInsertInt>(`${process.env.projectsCollection}`);
  return coll;
}

export async function projectFindOne(
  conn: MongoClient,
  query: Partial<projectsInt>
) {
  const wquery = convPartialProj(query);
  const result = await (await getProjectColl(conn))
    .findOne(wquery)
    .then((value) => {
      return value;
    });
  if (result) {
    const qresult = convPartialProjBack(result);
    return qresult;
  } else {
    return null;
  }
}

export async function projectFindAll(
  conn: MongoClient,
  query: Partial<projectsInt>,
  options = {}
) {
  const wquery = convPartialProj(query);
  const result = await (await getProjectColl(conn))
    .find(wquery, options)
    .toArray();
  const qresult = result.map((res) => {
    return convPartialProjBack(res);
  });
  return qresult;
}

function convPartialProjBack(query: Partial<projectsInsertInt>) {
  const {
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudget,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": sbudgetWT,
    ...r
  } = query;
  let wquery: Partial<projectsInt> = { ...r };
  if (sbudget) {
    wquery["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"] = Big(sbudget);
  }
  if (sbudgetWT) {
    wquery["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] = Big(sbudgetWT);
  }
  return wquery as WithId<projectsInt>;
}

function convPartialProj(
  query: Partial<projectsInt>
): Partial<projectsInsertInt> {
  const {
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": budget,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": budgetWT,
    ...r
  } = query;
  let wquery: Partial<projectsInsertInt> = { ...r };
  if (budget) {
    wquery["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"] = budget.toString();
  }
  if (budgetWT) {
    wquery["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] = budgetWT.toString();
  }
  return wquery;
}

function convProj(query: projectsInt): projectsInsertInt {
  const {
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": budget,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": budgetWT,
    ...r
  } = query;
  const wquery: projectsInsertInt = {
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": budget.toString(),
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": budgetWT.toString(),
    ...r,
  };
  return wquery;
}

export async function projectInsertOne(conn: MongoClient, query: projectsInt) {
  const wquery = convProj(query);
  const result = await (await getProjectColl(conn))
    .insertOne(wquery)
    .then((value) => {
      return value.insertedId;
    });
  await initProject(
    conn,
    result,
    query["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"]
  );
  return result;
}

export async function projectUpdateOne(
  conn: MongoClient,
  query: { _id: ObjectId },
  upsert: projectsInt
) {
  const wupsert = convPartialProj(upsert);
  const result = await (await getProjectColl(conn))
    .updateOne(query, { $set: wupsert })
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function projectDistinct(
  conn: MongoClient,
  field: keyof projectsInt,
  query: Partial<projectsInt>
) {
  const result = await (await getProjectColl(conn)).distinct(field, query);
  return result;
}

export interface stagesInt {
  _id?: ObjectId;
  projId: ObjectId;
  name: string;
  status: StagesProgress;
  order: number;
}

async function getStagesColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<stagesInt>(`${process.env.stagesCollection}`);
  return coll;
}

export async function stagesInsertOne(conn: MongoClient, query: stagesInt) {
  const result = await (await getStagesColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function stagesFindAll(
  conn: MongoClient,
  query: Partial<stagesInt>,
  options = {}
) {
  const result = await (await getStagesColl(conn))
    .find(query, options)
    .toArray();
  return result;
}

export async function stagesUpdateOne(
  conn: MongoClient,
  query: { _id: ObjectId },
  upsert: Partial<stagesInt>
) {
  const result = await (await getStagesColl(conn))
    .updateOne(query, { $set: upsert })
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

const threshold = 100000000;

export async function initProject(
  conn: MongoClient,
  pid: ObjectId,
  budget: Big
) {
  const type = budget.cmp(threshold) ? 0 : 1;
  const stname = stageNames[type];
  for (let index = 0; index < stname.length; index++) {
    const element = stname[index];
    const newstage: stagesInt = {
      projId: pid,
      order: index,
      status: StagesProgress.OnGoing,
      name: element,
    };
    await stagesInsertOne(conn, newstage);
  }
}

interface projectFilesInt {
  _id?: ObjectId;
  projId: ObjectId;
  fileId: ObjectId;
}

async function getProjectFilesColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<projectFilesInt>(`${process.env.projFilesCollection}`);
  return coll;
}

export async function projectFilesInsertOne(
  conn: MongoClient,
  query: projectFilesInt
) {
  const result = await (await getProjectFilesColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function projectFilesDeleteOne(
  conn: MongoClient,
  filter: Partial<projectFilesInt>
) {
  const result = (await (await getProjectFilesColl(conn)).deleteOne(filter))
    .acknowledged;
  return result;
}

export async function projectFilesFindAll(
  conn: MongoClient,
  query: Partial<projectFilesInt>
) {
  const result = await (await getProjectFilesColl(conn)).find(query).toArray();
  return result;
}

export async function getFileMetadata(query: Partial<fileMetadataInt>) {
  const result = await (await getMongoClient())
    .db(`${process.env.dbName}`)
    .collection<fileMetadataInt>(`${process.env.filesMetadataCollection}`)
    .findOne(query);
  return result;
}

interface stageFilesInt {
  _id?: ObjectId;
  projId: ObjectId;
  stageId: ObjectId;
  fileId: ObjectId;
}

async function getStageFilesColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<projectFilesInt>(`${process.env.stageFilesCollection}`);
  return coll;
}

export async function stageFilesFindAll(
  conn: MongoClient,
  query: Partial<stageFilesInt>
) {
  const result = await (await getStageFilesColl(conn)).find(query).toArray();
  return result;
}

export async function stageFilesInsertOne(
  conn: MongoClient,
  query: stageFilesInt
) {
  const result = await (await getStageFilesColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function stageFilesDeleteOne(
  conn: MongoClient,
  filter: Partial<stageFilesInt>
) {
  const result = (await (await getStageFilesColl(conn)).deleteOne(filter))
    .acknowledged;
  return result;
}

export interface equipmentsGroupInt {
  _id?: ObjectId;
  name: string;
  desc: string;
  order: number;
}

async function getEquipmentsGroupColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<equipmentsGroupInt>(`${process.env.equipmentsGroupCollection}`);
  return coll;
}

export async function equipmentsGroupFindAll(
  conn: MongoClient,
  query: Partial<equipmentsGroupInt>
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .find(query)
    .toArray();
  return result;
}

export async function equipmentsGroupInsertOne(
  conn: MongoClient,
  query: equipmentsGroupInt
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function equipmentsGroupDeleteOne(
  conn: MongoClient,
  filter: Partial<equipmentsGroupInt>
) {
  const result = (await (await getEquipmentsGroupColl(conn)).deleteOne(filter))
    .acknowledged;
  return result;
}
