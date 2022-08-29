import { itemObjectInt, projectsInt } from "../db";
import { Big } from "big.js";
import { fetcher } from "../frontend";
import { retDatacreateproject } from "../../pages/api/create/projects";
import { ObjectId } from "bson";

const __today = () => new Date();
const today = () => {
  const _today = __today();
  return new Date(
    _today.getFullYear(),
    _today.getMonth(),
    _today.getDate(),
    0,
    0,
    0,
    0
  );
};

export interface projectsTableInt {
  รายการโครงการจัดซื้อจัดจ้าง: string;
  ประเภทโครงการ: number;
  จำนวนหน่วย: itemObjectInt;
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": Big;
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": Big;
  ประเภทงบประมาณ: string;
  "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": Date;
  "วันเริ่มสัญญา (พ.ศ.)": Date;
  "MA (ระยะเวลารับประกัน)": itemObjectInt;
  "วันเริ่ม MA (พ.ศ.)": Date;
  "วันหมดอายุ MA (พ.ศ.)": Date;
  หมายเหตุ: string;
}

export const projectsDefaultValue: projectsTableInt = {
  รายการโครงการจัดซื้อจัดจ้าง: "",
  ประเภทโครงการ: 1,
  จำนวนหน่วย: { amount: 0, unit: "หน่วย" },
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": new Big(0),
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": new Big(0),
  ประเภทงบประมาณ: "",
  "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": today(),
  "วันเริ่มสัญญา (พ.ศ.)": today(),
  "MA (ระยะเวลารับประกัน)": { amount: 0, unit: "ปี" },
  "วันเริ่ม MA (พ.ศ.)": today(),
  "วันหมดอายุ MA (พ.ศ.)": today(),
  หมายเหตุ: "",
};

export function valInteger(v: string) {
  try {
    const num = parseInt(v);
    return num > 0 ? num : 0;
  } catch (err) {
    return -1;
  }
}

export function valTypeList(v: string) {
  try {
    const vnum = valInteger(v);
    if (vnum >= 1 && vnum <= 3) {
      return vnum;
    } else {
      return 0;
    }
  } catch (err) {
    return 0;
  }
}

export function valFloat(v: string | number) {
  try {
    const fl = new Big(v);
    return fl.cmp(0) ? fl : new Big(0);
  } catch (err) {
    return new Big(-1);
  }
}

export function valItem(v: string): itemObjectInt {
  try {
    const { amount, unit } = JSON.parse(v) as itemObjectInt;
    const vnum = valInteger(amount + "");
    if (vnum < 0) {
      return { amount: -1, unit: unit };
    } else {
      return { amount: amount, unit: unit };
    }
  } catch (err) {
    return { amount: -1, unit: "" };
  }
}

export const valYear = (v: string) => {
  try {
    const vnum = valDate(v);
    if (vnum) {
      return new Date(vnum.getFullYear(), 0, 1);
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

export const valDate = (v: string) => {
  try {
    return new Date(v);
  } catch (err) {
    return null;
  }
};

export function convertRawCSVToData(data: {
  [key in keyof projectsInt]: any;
}): projectsTableInt {
  let io1 = parseio(data.จำนวนหน่วย);
  let io2 = parseio(data["MA (ระยะเวลารับประกัน)"]);
  let dt1 = parsedate(data["วันเริ่มสัญญา_buddhist"]);
  let dt2 = parsedate(data["วันเริ่ม MA_buddhist"]);
  let dt3 = parsedate(data["วันหมดอายุ MA_buddhist"]);
  let l: number = 1;
  if (typeof data.ประเภทโครงการ === "string") {
    if (data.ประเภทโครงการ.includes("ซื้อ")) {
      l = 1;
    } else if (data.ประเภทโครงการ.includes("เช่า")) {
      l = 3;
    } else if (data.ประเภทโครงการ.includes("จ้าง")) {
      l = 2;
    }
  }
  const c: projectsTableInt = {
    รายการโครงการจัดซื้อจัดจ้าง: data.รายการโครงการจัดซื้อจัดจ้าง || "",
    ประเภทโครงการ: l,
    จำนวนหน่วย: io1,
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": new Big(
      data["งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)"] + ""
    ),
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": new Big(
      data["งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)"] + ""
    ),
    ประเภทงบประมาณ: data.ประเภทงบประมาณ,
    "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": new Date(
      parseInt(data["ปีที่ดำเนินการจัดซื้อจัดจ้าง_buddhist"] + "") - 543,
      0,
      1
    ),
    "วันเริ่มสัญญา (พ.ศ.)": dt1,
    "MA (ระยะเวลารับประกัน)": io2,
    "วันเริ่ม MA (พ.ศ.)": dt2,
    "วันหมดอายุ MA (พ.ศ.)": dt3,
    หมายเหตุ: data.หมายเหตุ || "",
  };
  return c;

  function parseio(ob: any) {
    let io: itemObjectInt = { amount: 0, unit: "" };
    try {
      if (ob && typeof ob === "string") {
        let arr = ob.split(" ");
        if (arr.length === 2) {
          io = { amount: parseInt(arr[0]), unit: arr[1] };
        }
      } else if ("amount" in ob && "unit" in ob) {
        io = { amount: ob.amount, unit: ob.unit };
      }
    } catch (err) {}
    return io;
  }

  function parsedate(ob: any) {
    let d = new Date();
    try {
      if (typeof ob === "string") {
        let arr = ob.split("/");
        if (arr.length === 3) {
          d = new Date(
            parseInt(arr[2]) - 543,
            parseInt(arr[1]) - 1,
            parseInt(arr[0])
          );
        }
      } else {
        if (Object.prototype.toString.call(ob) === "[object Date]") {
          d = new Date(ob.getFullYear(), ob.getMonth(), ob.getDate());
        }
      }
    } catch (err) {}
    return d;
  }
}

export async function createNewProject(query: projectsInt) {
  const data = (await fetcher(
    "/api/create/projects",
    query
  )) as retDatacreateproject;
  const pid = new ObjectId(data.pid);
  return pid;
}
