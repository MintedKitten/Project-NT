import { ObjectId } from "bson";
import { getMongoClient, projectFilesInsertOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

/**
 * Api return type
 */
export type retDatacreatefiles = {
  isAllSuccessful: boolean;
};

/**
 * Add file to project
 */
const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const pid = new ObjectId(body.pid);
    const _fmids: string[] = body.fmids;
    const fmids = _fmids.map((fmid) => {
      return new ObjectId(fmid);
    });
    let isAllSuccessful = true;
    for (let index = 0; index < fmids.length; index++) {
      const element = fmids[index];
      isAllSuccessful =
        isAllSuccessful &&
        (await projectFilesInsertOne(conn, { projId: pid, fileId: element }));
    }

    res.status(200).json({ data: { isAllSuccessful: isAllSuccessful } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
