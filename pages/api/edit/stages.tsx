import { ObjectId } from "bson";
import { getMongoClient, stagesUpdateOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDataeditstages = {
  isUpdateSuccesful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const stid = new ObjectId(body.stid);
    const newstatus = body.status;
    const conn = await getMongoClient();
    const isUpdateSuccesful = await stagesUpdateOne(
      conn,
      { _id: stid },
      { $set: { status: newstatus } }
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
