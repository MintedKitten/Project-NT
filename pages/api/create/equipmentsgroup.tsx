import { ObjectId } from "bson";
import { equipmentsGroupInsertOne, getMongoClient } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retCreateequipmentsgroup = {
  eqgId: string;
};

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const pid = new ObjectId(body.pid);
    const eqgName = body.eqgName;
    const eqgDesc = body.eqgDesc;
    const eqgQty = body.eqgQty;
    // const 
    // const eqgId = await equipmentsGroupInsertOne(conn, {
    //   projId: pid,
    //   desc: eqgDesc,
    //   name: eqgName,
    //   qty: eqgQty,
    // });

    res.status(200).json({ data: { eqgId: "" } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
