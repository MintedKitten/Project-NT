import Big from "big.js";
import { ObjectId } from "bson";
import { getMongoClient, projectInsertOne, projectsInt } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";
import { thDate } from "../../../src/local";

export type retDatacreateproject = { pid: ObjectId };

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body) as { [key in keyof projectsInt]: any };
    const query: projectsInt = {
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
    const result = await projectInsertOne(conn, query);
    res.status(200).json({ data: { pid: result } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
