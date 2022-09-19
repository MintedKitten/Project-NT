import { ObjectId } from "bson";
import { getMongoClient, stagesUpdateOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

/**
 * Api return type
 */
export type retDataeditstages = {
  isUpdateSuccesful: boolean;
};

/**
 * Update the stages
 */
const handler = nxcHandler().all(async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const stid = new ObjectId(body.stid);
    const newstatus = body.status;
    const completeDate = new Date(body.date);
    const conn = await getMongoClient();
    const isUpdateSuccesful = await stagesUpdateOne(
      conn,
      { _id: stid },
      { $set: { status: newstatus, completeDate: completeDate } }
    );
    await conn.close();
    return res
      .status(200)
      .json({ data: { isUpdateSuccesful: isUpdateSuccesful } });
  } catch (err) {
    return res.status(400).end();
  }
});
export default handler;
