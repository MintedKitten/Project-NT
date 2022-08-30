import { ObjectId } from "bson";
import { getMongoClient, stageFilesDeleteOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDataeditstagefiles = {
  isDeleteSuccessful: boolean;
};

const handler = nxcHandler().all(async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const fileId = new ObjectId(body.fileId);
    const conn = await getMongoClient();
    const isDeleteSuccessful = await stageFilesDeleteOne(conn, {
      fileId: fileId,
    });
    await conn.close();
    return res
      .status(200)
      .json({ data: { isDeleteSuccessful: isDeleteSuccessful } });
  } catch (err) {
    return res.status(400).end();
  }
});
export default handler;
