/**
 * @file Frontend to Backend, Project Details Create functions
 */
import { itemObjectInt, projectsInt } from "../db";
import { Big } from "big.js";
import { fetcher } from "../frontend";
import { retDatacreateproject } from "../../pages/api/create/projects";
import { ObjectId } from "bson";
import { parseInteger } from "../local";

const __today = () => new Date();
const today = (day = 0) => {
  const _today = __today();
  return new Date(
    _today.getFullYear(),
    _today.getMonth(),
    _today.getDate() + day,
    0,
    0,
    0,
    0
  );
};

/**
 * Definition for project details display form
 */
export interface projectsTableInt {
  รายการโครงการจัดซื้อจัดจ้าง: string;
  ประเภทโครงการ: number;
  จำนวนหน่วย: itemObjectInt;
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": string;
  ประเภทงบประมาณ: string;
  "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": Date;
  "วันเริ่มสัญญา (พ.ศ.)": Date;
  "วันหมดสัญญา (พ.ศ.)": Date;
  "วันเริ่ม MA (พ.ศ.)": Date;
  "วันหมดอายุ MA (พ.ศ.)": Date;
  หมายเหตุ: string;
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": string;
  "MA (ระยะเวลารับประกัน)": string;
}

/**
 * Default value for starting adding a new projects
 */
export const projectsDefaultValue: projectsTableInt = {
  รายการโครงการจัดซื้อจัดจ้าง: "",
  ประเภทโครงการ: 1,
  จำนวนหน่วย: { amount: 0, unit: "หน่วย" },
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)": "0",
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": "",
  ประเภทงบประมาณ: "",
  "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": today(),
  "วันเริ่มสัญญา (พ.ศ.)": today(),
  "MA (ระยะเวลารับประกัน)": "",
  "วันเริ่ม MA (พ.ศ.)": today(),
  "วันหมดอายุ MA (พ.ศ.)": today(),
  หมายเหตุ: "",
  "วันหมดสัญญา (พ.ศ.)": today(1),
};

/**
 * Validating an integer.
 * If positive or zero return itself.
 * If negative return -1.
 * @param v The string to validate
 * @returns Validated integer
 */
export function valInteger(v: string) {
  try {
    const num = parseInteger(v);
    return num > 0 ? num : 0;
  } catch (err) {
    return -1;
  }
}

/**
 * Validating a typelist.
 * If within range return itself.
 * If not return 0.
 * @param v The string to validate
 * @returns Validated typelist
 */
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

/**
 * Validating a floating point number. Convert to Big.js for better precision.
 * If positive or zero return itself.
 * If negative return -1.
 * @param v The string or number to validate
 * @returns Validated floating point number
 */
export function valFloat(v: string | number) {
  try {
    const fl = new Big(v);
    return fl.cmp(0) ? fl : new Big(0);
  } catch (err) {
    return new Big(-1);
  }
}

/**
 * Validating an item.
 * If amount is positive or zero return Item Object.
 * If amount is negative return Item Object with amount -1.
 * @param v The string to validate
 * @returns Validated item
 */
export function valItem(v: string): itemObjectInt {
  try {
    const { amount, unit } = JSON.parse(v) as itemObjectInt;
    const vnum = valInteger(amount + "");
    if (vnum < 0) {
      return { amount: -1, unit: unit };
    } else {
      return { amount: vnum, unit: unit };
    }
  } catch (err) {
    return { amount: -1, unit: "" };
  }
}

/**
 * Validating a year.
 * If can be turn into a Date return year.
 * If can't return null;
 * @param v The string to validate
 * @returns Validated year or null
 */
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

/**
 * Validating a date.
 * If can be turn into a Date return date Object.
 * If can't return null;
 * @param v The string to validate
 * @returns Validated year or null
 */
export const valDate = (v: string) => {
  try {
    return new Date(v);
  } catch (err) {
    return null;
  }
};

/**
 * Definition for Importing from CSV file: Projects
 */
export interface projectsCSVInt {
  projName: string;
  type: string | number;
  systemCount: string;
  budget: string;
  budgetType: string;
  procurementYear: number;
  contractstartDate: string;
  contractendDate: string;
  mastartDate: string;
  maendDate: string;
  comments: string;
}

/**
 * Class for validating imported CSV file columns: Projects
 */
export class projectsCSVClass implements projectsCSVInt {
  projName: string = "";
  type: string | number = "";
  systemCount: string = "";
  budget: string = "";
  budgetType: string = "";
  procurementYear: number = 0;
  contractstartDate: string = "";
  contractendDate: string = "";
  mastartDate: string = "";
  maendDate: string = "";
  comments: string = "";
}

/**
 * Convert raw CSV row into Projects
 * @throws Incorrect data definition in column
 * @param data the row data
 * @returns Converted data
 */
export function convertRawCSVToData(data: projectsCSVInt): projectsTableInt {
  let systemCount = parseio(data.systemCount, "systemCount");
  let contractstartDate = parsedate(
    data.contractstartDate,
    "contractstartDate"
  );
  let contractendDate = parsedate(data.contractendDate, "contractendDate");
  let mastartDate = parsedate(data.mastartDate, "mastartDate");
  let maendDate = parsedate(data.maendDate, "maendDate");
  let type = parsetype(data.type, "type");
  let procYear = 0;
  try {
    procYear = parseInteger(data.procurementYear + "") - 543;
  } catch (err) {
    throw new Error("Incorrect data on column procurementYear");
  }
  try {
    Big((data.budget + "").replace(/,/g, ""));
  } catch (err) {
    throw new Error("Incorrect data on column budget");
  }
  const c: projectsTableInt = {
    รายการโครงการจัดซื้อจัดจ้าง: data.projName || "",
    ประเภทโครงการ: type,
    จำนวนหน่วย: systemCount,
    "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)": "",
    ประเภทงบประมาณ: data.budgetType,
    "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)": new Date(procYear, 0, 1),
    "วันเริ่มสัญญา (พ.ศ.)": contractstartDate,
    "วันเริ่ม MA (พ.ศ.)": mastartDate,
    "วันหมดอายุ MA (พ.ศ.)": maendDate,
    หมายเหตุ: data.comments || "",
    "วันหมดสัญญา (พ.ศ.)": contractendDate,
    "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)":
      Big((data.budget + "").replace(/,/g, "")).toNumber() + "",
    "MA (ระยะเวลารับประกัน)": "",
  };
  return c;

  function parsetype(type: number | string, column: string) {
    if (typeof type === "string") {
      if (type.includes("ซื้อ")) {
        return 1;
      } else if (type.includes("เช่า")) {
        return 3;
      } else if (type.includes("จ้าง")) {
        return 2;
      }
    } else {
      if (type > 0 && type < 4) {
        return type;
      }
    }
    throw new Error("Incorrect data on column " + column);
  }

  function parseio(ob: string, column: string) {
    try {
      const split = ob.indexOf(" ");
      if (split > 0) {
        if (ob.substring(split + 1).length > 0) {
          return {
            amount: parseInteger(ob.substring(0, split)),
            unit: ob.substring(split + 1),
          } as itemObjectInt;
        }
      }
      throw new Error("Incorrect data on column " + column);
    } catch (err) {
      throw new Error("Incorrect data on column " + column);
    }
  }

  function parsedate(ob: string, column: string) {
    try {
      let arr = ob.split("/");
      if (arr.length === 3) {
        return new Date(
          parseInteger(arr[2]) - 543,
          parseInteger(arr[1]) - 1,
          parseInteger(arr[0])
        );
      }
      throw new Error("Incorrect data on column " + column);
    } catch (err) {
      throw new Error("Incorrect data on column " + column);
    }
  }
}

/**
 * Add project
 * @param query The project details
 * @returns true if addition is successful, otherwise false
 */
export async function createNewProject(query: projectsInt) {
  const data = (await fetcher(
    "/api/create/projects",
    query
  )) as retDatacreateproject;
  const pid = new ObjectId(data.pid);
  return pid;
}
