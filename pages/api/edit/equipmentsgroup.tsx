import { ObjectId } from "bson";
import {
  equipmentsGroupInsertOne,
  equipmentsGroupLastOrderInProject,
  equipmentsGroupUpdateMany,
  equipmentsGroupUpdateOne,
  getMongoClient,
} from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retEditequipmentsgroup = {
  isUpdateSuccessful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const eqgid = new ObjectId(body.eqgid);
    const eqgName = body.eqgName;
    const eqgDesc = body.eqgDesc;
    const eqgQty = body.eqgQty;
    const query = {
      name: eqgName,
      desc: eqgDesc,
      qty: eqgQty,
    };
    const isUpdateSuccessful = await equipmentsGroupUpdateOne(
      conn,
      { _id: eqgid },
      { $set: query }
    );
    res.status(200).json({ data: { isUpdateSuccessful: isUpdateSuccessful } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
