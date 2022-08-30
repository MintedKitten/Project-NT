import Big from "big.js";
import { ObjectId } from "bson";
import { getMongoClient, projectsInt, projectUpdateOne } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";
import { thDate } from "../../../src/local";

export type retDataeditproject = { isUpdated: boolean };

const handler = nxcHandler().all(async (req, res) => {
  const conn = await getMongoClient();
  try {
    const body = JSON.parse(req.body);
    const upsert: projectsInt = {
      รายการโครงการจัดซื้อจัดจ้าง: body["รายการโครงการจัดซื้อจัดจ้าง"],
      ประเภทโครงการ: body["ประเภทโครงการ"],
      จำนวนหน่วย: body["จำนวนหน่วย"],
      "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": Big(
        body["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"]
      ),
      "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": Big(
        body["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"]
      ),
      ประเภทงบประมาณ: body["ประเภทงบประมาณ"],
      ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist:
        body["ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist"],
      วันเริ่มสัญญา_buddhist: thDate(body["วันเริ่มสัญญา_buddhist"]),
      "MA (ระยะเวลารับประกัน)": body["MA (ระยะเวลารับประกัน)"],
      "วันเริ่ม MA_buddhist": thDate(body["วันเริ่ม MA_buddhist"]),
      "วันหมดอายุ MA_buddhist": thDate(body["วันหมดอายุ MA_buddhist"]),
      หมายเหตุ: body["หมายเหตุ"],
      createdby: new ObjectId(body["createdby"]),
      lastupdate: thDate(new Date()),
    };
    const query = { _id: new ObjectId(body["_id"]) };
    const result = await projectUpdateOne(conn, query, { $set: { ...upsert } });
    res.status(200).json({ data: { isUpdated: result } });
  } catch (err) {
    res.status(400).end();
  } finally {
    await conn.close();
  }
});
export default handler;
