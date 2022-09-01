import { ObjectId } from "bson";
import {
  equipmentsDeleteMany,
  equipmentsGroupDeleteOne,
  equipmentsGroupFindOne,
  equipmentsGroupUpdateMany,
  getMongoClient,
} from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDeleteequipmentsgroup = {
  isDeleteSuccessful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const eqgid = new ObjectId(body.eqgId);
    const deletedEqg = await equipmentsGroupFindOne(conn, { _id: eqgid });
    let isDeleteSuccessful = false;
    if (deletedEqg) {
      let isDeleted = false;
      isDeleted =
        (await equipmentsGroupDeleteOne(conn, {
          _id: deletedEqg._id,
        })) && (await equipmentsDeleteMany(conn, { eqgId: deletedEqg._id }));
      if (isDeleted) {
        isDeleteSuccessful = await equipmentsGroupUpdateMany(
          conn,
          { projId: deletedEqg.projId, order: { $gte: deletedEqg?.order } },
          { $inc: { order: -1 } }
        );
      }
    }
    res.status(200).json({ data: { isDeleteSuccessful: isDeleteSuccessful } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
