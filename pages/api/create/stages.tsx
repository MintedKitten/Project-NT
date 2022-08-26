import { ObjectId } from "bson";
import { getMongoClient, stageFilesInsertOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDatacreatestages = {
  isAllSuccessful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const pid = new ObjectId(body.pid);
    const stid = new ObjectId(body.stid);
    const _fmids: string[] = body.fmids;
    const fmids = _fmids.map((fmid) => {
      return new ObjectId(fmid);
    });
    let isAllSuccessful = true;
    for (let index = 0; index < fmids.length; index++) {
      const element = fmids[index];
      console.log("Adding: " + element.toHexString());
      isAllSuccessful =
        isAllSuccessful &&
        (await stageFilesInsertOne(conn, {
          projId: pid,
          stageId: stid,
          fileId: element,
        }));
    }
    res.status(200).json({ data: { isAllSuccessful: isAllSuccessful } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
