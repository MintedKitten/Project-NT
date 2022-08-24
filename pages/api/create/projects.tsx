import Big from "big.js";
import { ObjectId } from "bson";
import { getMongoClient, projectInsertOne, projectsInt } from "../../../src/db";
import { nxcHandler } from "../../../src/defaultHandler";

export type retDatacreateproject = { pid: ObjectId };

const handler = nxcHandler().all(async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const query: projectsInt = {
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
      วันเริ่มสัญญา_buddhist: body["วันเริ่มสัญญา_buddhist"],
      "MA (ระยะเวลารับประกัน)": body["MA (ระยะเวลารับประกัน)"],
      "วันเริ่ม MA_buddhist": body["วันเริ่ม MA_buddhist"],
      "วันหมดอายุ MA_buddhist": body["วันหมดอายุ MA_buddhist"],
      หมายเหตุ: body["หมายเหตุ"],
      createdby: new ObjectId(body["createdby"]),
    };
    const conn = await getMongoClient();
    const result = await projectInsertOne(conn, query);
    conn.close();
    return res.status(200).json({ data: { pid: result } });
  } catch (err) {
    return res.status(400).end();
  }
});
export default handler;
