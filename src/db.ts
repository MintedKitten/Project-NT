/**
 * @file Connecting, and CRUD to MongoDB
 */
import { ObjectId } from "bson";
import { createHash } from "crypto";
import {
  Filter,
  FindOptions,
  MongoClient,
  UpdateFilter,
  UpdateResult,
  WithId,
} from "mongodb";
import { Big } from "big.js";
import { budgetThreshold, stageNames, StagesProgress } from "./local";

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

/**
 * Column Definition for collection: FilesMetadata
 */
export interface fileMetadataInt {
  _id?: ObjectId;
  filename: string;
  filetype: string;
  contentType: string;
  size: number;
  uploadDate: Date;
}

/**
 * Column Definition for collection: User
 */
export interface userInt {
  _id?: ObjectId;
  username: string;
  password: string;
  name: string;
  admin: boolean;
}

export async function getMongoClient() {
  const conn = await new MongoClient(
    `${process.env.NEXT_MONGO_STRING}`
  ).connect();
  return conn;
}

async function getAuthColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<userInt>(`${process.env.userColl}`);
  return coll;
}

export async function authFindOne(conn: MongoClient, query: Filter<userInt>) {
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

/**
 * Definition for Object Item
 */
export interface itemObjectInt {
  amount: number;
  unit: string;
}

/**
 * Column Definition for collection: Projects
 */
interface projectsInsertInt {
  _id?: ObjectId;
  projName: string;
  type: number;
  systemCount: itemObjectInt;
  budget: string;
  budgetType: string;
  procurementYear: number;
  contractstartDate: Date;
  contractendDate: Date;
  mastartDate: Date;
  maendDate: Date;
  comments: string;
  createdby: ObjectId;
  lastupdate: Date;
}

/**
 * Definition for parsing collection: Projects
 */
export interface projectsInt {
  _id?: ObjectId;
  projName: string;
  type: number;
  systemCount: itemObjectInt;
  budget: Big;
  budgetType: string;
  procurementYear: number;
  contractstartDate: Date;
  contractendDate: Date;
  mastartDate: Date;
  maendDate: Date;
  comments: string;
  createdby: ObjectId;
  lastupdate: Date;
}

async function getProjectColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<projectsInsertInt>(`${process.env.projectsColl}`);
  return coll;
}

export async function projectFindOne(
  conn: MongoClient,
  query: Partial<projectsInsertInt>
) {
  const result = await (await getProjectColl(conn))
    .findOne(query)
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
  options: FindOptions<projectsInt> = {}
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
  const { budget: sbudget, ...r } = query;
  let wquery: Partial<projectsInt> = { ...r };
  if (sbudget) {
    wquery["budget"] = Big(sbudget);
  }
  return wquery as WithId<projectsInt>;
}

function convPartialProj(
  query: Partial<projectsInt>
): Partial<projectsInsertInt> {
  const { budget, ...r } = query;
  let wquery: Partial<projectsInsertInt> = { ...r };
  if (budget) {
    wquery["budget"] = budget.toString();
  }
  return wquery;
}

function convUpdateProj(
  query: UpdateFilter<projectsInt>
): UpdateFilter<projectsInsertInt> {
  if (query.$set) {
    const { budget, ...r } = query.$set;
    let rqry = { ...r } as Partial<projectsInsertInt>;
    if (budget) {
      rqry["budget"] = budget.toString();
    }
    const wquery: UpdateFilter<projectsInsertInt> = { $set: { ...rqry } };
    return wquery;
  } else {
    return {};
  }
}

function convProj(query: projectsInt): projectsInsertInt {
  const { budget, ...r } = query;
  const wquery: projectsInsertInt = {
    budget: budget.toString(),
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
  await initProject(conn, result, query["budget"]);
  return result;
}

export async function projectUpdateOne(
  conn: MongoClient,
  query: { _id: ObjectId },
  upsert: UpdateFilter<projectsInt>
) {
  const wupsert = convUpdateProj(upsert);
  const result = await (await getProjectColl(conn))
    .updateOne(query, wupsert)
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

/**
 * Column Definition for collection: Stages
 */
export interface stagesInt {
  _id?: ObjectId;
  projId: ObjectId;
  name: string;
  status: StagesProgress;
  order: number;
  completeDate: Date;
}

async function getStagesColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<stagesInt>(`${process.env.stagesColl}`);
  coll.createIndex({ order: 1 });
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
  upsert: UpdateFilter<stagesInt>
) {
  const result = await (await getStagesColl(conn))
    .updateOne(query, upsert)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function initProject(
  conn: MongoClient,
  pid: ObjectId,
  budget: Big
) {
  const type = budget.cmp(budgetThreshold) < 0 ? 0 : 1;
  const stname = stageNames[type];
  for (let index = 0; index < stname.length; index++) {
    const element = stname[index];
    const newstage: stagesInt = {
      projId: pid,
      order: index,
      status: StagesProgress.OnGoing,
      name: element,
      completeDate: new Date(),
    };
    await stagesInsertOne(conn, newstage);
  }
}

/**
 * Column Definition for collection: ProjFiles
 */
interface projectFilesInt {
  _id?: ObjectId;
  projId: ObjectId;
  fileId: ObjectId;
}

async function getProjectFilesColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<projectFilesInt>(`${process.env.projFilesColl}`);
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
  filter: Filter<projectFilesInt>
) {
  const result = (await (await getProjectFilesColl(conn)).deleteOne(filter))
    .acknowledged;
  return result;
}

export async function projectFilesFindAll(
  conn: MongoClient,
  query: Filter<projectFilesInt>
) {
  const result = await (await getProjectFilesColl(conn)).find(query).toArray();
  return result;
}

export async function getFileMetadata(
  conn: MongoClient,
  query: Filter<fileMetadataInt>
) {
  const result = await conn
    .db(`${process.env.dbName}`)
    .collection<fileMetadataInt>(`${process.env.filesMetadataColl}`)
    .findOne(query);
  return result;
}

/**
 * Column Definition for collection: StageFiles
 */
interface stageFilesInt {
  _id?: ObjectId;
  projId: ObjectId;
  stageId: ObjectId;
  fileId: ObjectId;
}

async function getStageFilesColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<projectFilesInt>(`${process.env.stageFilesColl}`);
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

/**
 * Column Definition for collection: EquipmentsGroup
 */
export interface equipmentsGroupInt {
  _id?: ObjectId;
  projId: ObjectId;
  name: string;
  desc: string;
  qty: number;
  order: number;
}

async function getEquipmentsGroupColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<equipmentsGroupInt>(`${process.env.equipmentsGroupColl}`);
  coll.createIndex({ order: 1 });
  return coll;
}

export async function equipmentsGroupFindOne(
  conn: MongoClient,
  query: Filter<equipmentsGroupInt>
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .findOne(query)
    .then((res) => {
      return res;
    });
  return result;
}

export async function equipmentsGroupFindAll(
  conn: MongoClient,
  query: Filter<equipmentsGroupInt>
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .find(query)
    .toArray();
  return result;
}

export async function equipmentsGroupLastOrderInProject(
  conn: MongoClient,
  query: Filter<equipmentsGroupInt>
) {
  const ret = await (await getEquipmentsGroupColl(conn))
    .find(query)
    .sort({ order: "descending" })
    .limit(1)
    .toArray();
  return ret;
}

export async function equipmentsGroupInsertOne(
  conn: MongoClient,
  query: equipmentsGroupInt
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.insertedId;
    });
  return result;
}

export async function equipmentsGroupUpdateOne(
  conn: MongoClient,
  filter: Partial<equipmentsGroupInt>,
  upsert: UpdateFilter<equipmentsGroupInt>
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .updateOne(filter, upsert)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

// When a group is deleted
export async function equipmentsGroupDeleteOne(
  conn: MongoClient,
  filter: Filter<equipmentsGroupInt>
) {
  const result = (await (await getEquipmentsGroupColl(conn)).deleteOne(filter))
    .acknowledged;
  return result;
}

export async function equipmentsGroupUpdateMany(
  conn: MongoClient,
  filter: Filter<equipmentsGroupInt>,
  upsert: UpdateFilter<equipmentsGroupInt>
) {
  const result = await (await getEquipmentsGroupColl(conn))
    .updateMany(filter, upsert)
    .then((value) => {
      if (isInstanceUpdateResult(value)) {
        return value.acknowledged;
      } else {
        return false;
      }
    });
  return result;
}

function isInstanceUpdateResult(ob: any): ob is UpdateResult {
  return "acknowledged" in ob;
}

/**
 * Column Definition for collection: Equipments
 */
export interface equipmentsInt {
  _id?: ObjectId;
  projId: ObjectId;
  eqgId: ObjectId;
  partNumber: string;
  desc: string;
  qty: number;
  unit: string;
  unitPrice: string;
}

async function getEquipmentsColl(conn: MongoClient) {
  const coll = conn
    .db(`${process.env.dbName}`)
    .collection<equipmentsInt>(`${process.env.equipmentsColl}`);
  return coll;
}

export async function equipmentsFindAll(
  conn: MongoClient,
  query: Filter<equipmentsInt>,
  options: FindOptions<equipmentsInt> = {}
) {
  const result = await (await getEquipmentsColl(conn))
    .find(query, options)
    .toArray();
  return result;
}

export async function equipmentsInsertOne(
  conn: MongoClient,
  query: equipmentsInt
) {
  const result = await (await getEquipmentsColl(conn))
    .insertOne(query)
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function equipmentsUpsertOne(
  conn: MongoClient,
  query: Filter<equipmentsInt>,
  upsert: UpdateFilter<equipmentsInt>
) {
  const result = await (await getEquipmentsColl(conn))
    .updateOne(query, upsert, { upsert: true })
    .then((value) => {
      return value.acknowledged;
    });
  return result;
}

export async function equipmentsDeleteMany(
  conn: MongoClient,
  filter: Filter<equipmentsInt>
) {
  const result = (await (await getEquipmentsColl(conn)).deleteMany(filter))
    .acknowledged;
  return result;
}

/**
 * Equipments Join Projects
 * @param conn
 * @param query
 * @returns
 */
export async function eqJoinProj(conn: MongoClient, query: object) {
  const result = (await getEquipmentsColl(conn)).aggregate([
    { $match: query },
    {
      $lookup: {
        from: `${process.env.projectsColl}`,
        localField: "projId",
        foreignField: "_id",
        as: "proj_docs",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$proj_docs", 0] }, "$$ROOT"],
        },
      },
    },
  ]);
  return result;
}

/**
 * Projects join Stages, filter stages with status OnGoing
 * @param conn
 * @param query
 * @returns
 */
export async function projJoinStage(conn: MongoClient, query: object) {
  const info = await conn.db().admin().serverInfo();
  const version = parseFloat(info.versionArray[0] + "." + info.versionArray[1]);
  // Correlated Subqueries Using Concise Syntax: Only available from MongoDB 5.0 or higher
  // Normal Subqueries for MongoDB 4.4
  if (version > 4.4) {
    const result = (await getProjectColl(conn)).aggregate([
      { $match: query },
      {
        $lookup: {
          from: `${process.env.stagesColl}`,
          localField: "_id",
          foreignField: "projId",
          pipeline: [{ $match: { status: StagesProgress.OnGoing } }],
          as: "stages_docs",
        },
      },
    ]);
    return result;
  } else {
    const result = (await getProjectColl(conn)).aggregate([
      { $match: query },
      {
        $lookup: {
          from: `${process.env.stagesColl}`,
          pipeline: [
            { $match: { $expr: { $eq: ["_id", "projId"] } } },
          ],
          as: "stages_docs",
        },
      },
    ]);
    return result;
  }
}
