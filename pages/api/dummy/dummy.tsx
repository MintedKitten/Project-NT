import { NextApiResponse } from "next";
import { getMongoClient, projectFindAll, projectsInt } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type restype = {
  data: Awaited<ReturnType<typeof projectFindAll>>;
};

const handler = nxcHandler().all(async (req, res: NextApiResponse<restype>) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const name = body.name;
    const type = body.type;
    const year = body.year;
    const query: { [key in keyof projectsInt]?: any } = {};
    if (name) {
      query["projName"] = new RegExp(".*" + name + ".*");
    }
    if (type) {
      query["type"] = parseInt(type);
    }
    if (year) {
      query["procurementYear"] = parseInt(year);
    }
    const result = await projectFindAll(conn, query, {
      projection: {
        projName: 1,
        type: 1,
        procurementYear: 1,
      },
    });
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
