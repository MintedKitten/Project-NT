import { ObjectId } from "bson";
import { NextApiResponse } from "next";
import { rowCSVInt } from "../../../src/create/equipments";
import {
  equipmentsInsertOne,
  equipmentsInt,
  getMongoClient,
  projectFindAll,
} from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDatacreateequipments = {
  isCreateSuccessful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const pid = new ObjectId(body.pid);
    const eqgId = new ObjectId(body.eqgId);
    const rows = body.rows as rowCSVInt[];
    let isCreateSuccessful = true;
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const query: equipmentsInt = {
        projId: pid,
        eqgId: eqgId,
        partNumber: row.partNumber,
        desc: row.desc,
        qty: row.qty,
        unitPrice: row.uPrice,
      };
      isCreateSuccessful =
        isCreateSuccessful && (await equipmentsInsertOne(conn, query));
    }
    res.status(200).json({ data: { isCreateSuccessful: isCreateSuccessful } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
