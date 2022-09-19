import { ObjectId } from "bson";
import { equipmentsGroupInsertOne, equipmentsGroupLastOrderInProject, getMongoClient } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

/**
 * Api return type
 */
export type retCreateequipmentsgroup = {
  eqgId: string;
};

/**
 * Add equipments group to project
 */
const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const pid = new ObjectId(body.pid);
    const eqgName = body.eqgName;
    const eqgDesc = body.eqgDesc;
    const eqgQty = body.eqgQty;
    const retOrder = await equipmentsGroupLastOrderInProject(conn, { projId: pid });
    let order = 0;
    if (retOrder.length > 0) {
      order = retOrder[0].order + 1;
    }
    const query = {
      projId: pid,
      name: eqgName,
      desc: eqgDesc,
      qty: eqgQty,
      order: order,
    };
    const eqgId = await equipmentsGroupInsertOne(conn, query);
    res.status(200).json({ data: { eqgId: eqgId.toHexString() } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
