import { NextApiResponse } from "next";
import { getMongoClient, projectFindAll } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

// export type restype = {
//   data: Awaited<ReturnType<typeof projectFindAll>>;
// };

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    res.status(200).json({ data: "" });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
