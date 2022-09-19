import Big from "big.js";
import { ObjectId } from "bson";
import { getMongoClient, projectsInt, projectUpdateOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";
import { thDate } from "../../../src/local";

/**
 * Api return type
 */

export type retDataeditproject = { isUpdated: boolean };

/**
 * Update project details
 */
const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body) as { [key in keyof projectsInt]: any };
    const upsert: projectsInt = {
      projName: body.projName,
      type: body.type,
      systemCount: body.systemCount,
      budget: Big(body.budget),
      budgetType: body.budgetType,
      procurementYear: body.procurementYear,
      contractstartDate: thDate(body.contractstartDate),
      contractendDate: thDate(body.contractendDate),
      mastartDate: thDate(body.mastartDate),
      maendDate: thDate(body.maendDate),
      comments: body.comments,
      createdby: new ObjectId(),
      lastupdate: thDate(new Date()),
    };
    const query = { _id: new ObjectId(body["_id"]) };
    const result = await projectUpdateOne(conn, query, { $set: { ...upsert } });
    res.status(200).json({ data: { isUpdated: result } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
