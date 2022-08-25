import { ObjectId } from "bson";
import { getMongoClient, projectFilesInsertOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDatacreatefiles = {
  isAllSuccessful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const pid = new ObjectId(body.pid);
    const _fmids: string[] = body.fmids;
    const fmids = _fmids.map((fmid) => {
      return new ObjectId(fmid);
    });
    const conn = await getMongoClient();
    let isAllSuccessful = true;
    for (let index = 0; index < fmids.length; index++) {
      const element = fmids[index];
      console.log("Adding: " + element.toHexString());
      isAllSuccessful =
        isAllSuccessful &&
        (await projectFilesInsertOne(conn, { projId: pid, fileId: element }));
    }
    conn.close();
    return res.status(200).json({ data: { isAllSuccessful: isAllSuccessful } });
  } catch (err) {
    return res.status(400).end();
  }
});
export default handler;
