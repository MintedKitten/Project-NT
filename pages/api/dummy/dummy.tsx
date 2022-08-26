import { NextApiResponse } from "next";
import { getMongoClient, projectFindAll } from "../../../src/db";
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
    const query: { [key: string]: any } = {};
    if (name) {
      query["รายการโครงการจัดซื้อจัดจ้าง"] = new RegExp(".*" + name + ".*");
    }
    if (type) {
      query["ประเภทโครงการ"] = parseInt(type);
    }
    if (year) {
      query["ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist"] = parseInt(year);
    }
    const result = await projectFindAll(conn, query, {
      รายการโครงการจัดซื้อจัดจ้าง: 1,
      ประเภทโครงการ: 1,
      ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist: 1,
    });
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
