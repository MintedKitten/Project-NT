/**
 * @file Client Side File. Can only be imported and used both server and client sided.
 */
import {
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { FunctionComponent } from "react";
import "dayjs/locale/th";

/**
 * The enum type of the input for Project Details Input.
 * There are 8 types.
 * String: any text.
 * Integer: only integer.
 * Float: floating point numbers.
 * Date: day month year.
 * Year: year.
 * Item: amount of item and unit of item.
 * TypeList: dropdown selection.
 * Calculated: not used for inputing data, but for displaying data.
 */
export enum InputEn {
  String,
  Integer,
  Float,
  Date,
  Year,
  Item,
  TypeList,
  Calculated,
}

/**
 * The enum type of the status of the stages
 * There are 2 types.
 * OnGoing: in-progress stages.
 * Complete: done stages.
 */
export enum StagesProgress {
  OnGoing,
  Complete,
}

/**
 * The enum type of the status of the Deadline
 * There are 5 types.
 * Normal: not done and not within 3 months.
 * Complete: done and not passed deadline.
 * Alert: not done and within 3 months.
 * Passed: done and passed.
 * PastDue: not done and passed.
 */
export enum DateDeadlineStatus {
  Normal,
  Complete,
  Alert,
  Passed,
  PastDue,
}

/**
 * The display name for the @enum {DateDeadlineStatus}
 */
export const DeadlineName = [
  "In Progress",
  "Done",
  "High Priority",
  "Complete",
  "Late",
];

// The threshold for selecting between stages1 or stages2
export const budgetThreshold = 100000000;

const stageType1 = [
  "ขออนุมัติหลักการงบประมาณ",
  "นำเสนอขอส่งแผนจัดซื้อจัดจ้าง",
  "นำเสนอขออนุมัติความต้องการทางด้านเทคนิค (Technical Requirements)",
  "นำเสนอขออนุมัติแต่งตั้งคณะกรรมการจัดทำร่างขอบเขตของงานและกำหนดราคากลาง",
  "จัดทำเอกสารจัดซื้อจัดจ้างที่เกี่ยวข้องทั้งหมด ไปยังฝ่ายการพัสดุ 1/ศูนย์ธุรการรวม",
  "ทำเรื่องขอให้ศูนย์ธุรการรวมออกเลข PR และดำเนินการในส่วนอื่นๆ ที่เกี่ยวข้อง",
  "เปิดซอง และจัดทำเอกสาร Comly ด้านเทคนิค และเอกสารอื่นๆ ที่เกี่ยวข้องกับรายงานผลการเปิดซอง",
  "ดำเนินการตรวจร่างสัญญา",
  "ประชุม Kick Off Project",
  "Servey Site เพื่อเตรียมดำเนินการติดตั้งระบบ",
  "อนุมัติเอกสาร ATP",
  "ตรวจรับ",
  "จัดทำรายงานผลการตรวจรับ",
  "คืนหลักประกันค้ำสัญญา",
];

const stageType2 = [
  "จัดทำเอกสารนำเสนอคณะกรรมการบริหาร บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) (ขออนุมัติงบประมาณ ฯ)",
  "จัดทำเอกสารนำเสนอคณะกรรมการ บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) (ขออนุมัติงบประมาณ ฯ)",
  "จัดทำเอกสารนำเสนอเข้าวาระการประชุมผู้บริหารระดับสูง Management Committee (พิจารณาวิธีการจัดซื้อจัดจ้าง)",
  "จัดทำเอกสารนำเสนอคณะกรรมการ บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) (ขออนุมัติวิธีการจัดซื้อจัดจ้าง ฯ)",
  "จัดทำเอกสารนําเสนอ ข้อกําหนด รายละเอียดราคากลาง และงวดการชําระเงิน เข้าพิจารณาในคณะทํางานพิจารณากลั่นกรองด้านเทคนิค",
  "จัดทำเอกสารนำเสนอคณะกรรมการผู้บริหารระดับสูง Management Committee (พิจารณาขออนุมัติจ้าง)",
  "จัดทำเอกสารนำเสนอคณะกรรมการบริหาร บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) (พิจารณาขออนุมัติจ้าง)",
  "จัดทำเอกสารนำเสนอคณะกรรมการ บริษัท โทรคมนาคมแห่งชาติ จำกัด (มหาชน) (ขออนุมัติจ้าง)",
  "ทำเอกสารจัดซื้อจัดจ้างไปยังฝ่ายการพัสดุ 1",
  "ทำเรื่องขอให้ศูนย์ธุรการรวมออกเลข PR และดำเนินการในส่วนอื่นๆ ที่เกี่ยวข้อง",
  "เปิดซอง และจัดทำเอกสาร Comly ด้านเทคนิค และเอกสารอื่นๆ ที่เกี่ยวข้องกับรายงานผลการเปิดซอง",
  "ดำเนินการตรวจร่างสัญญา",
  "ประชุม Kick Off Project",
  "Servey Site เพื่อเตรียมดำเนินการติดตั้งระบบ",
  "อนุมัติเอกสาร ATP",
  "ตรวจรับ",
  "จัดทำรายงานผลการตรวจรับ",
  "คืนหลักประกันค้ำสัญญา",
];

/**
 * The stagwes Name for both types
 */
export const stageNames = [stageType1, stageType2];

/**
 * Turn the data string into Date Object
 * @param date The data
 * @returns The Date
 */
export function thDate(date: string | Date | number) {
  if (typeof date === "number") {
    return new Date(date, 0, 1);
  }
  const dt = new Date(date);
  const thdate = new Date(
    dt.getFullYear(),
    dt.getMonth(),
    dt.getDate(),
    dt.getHours(),
    dt.getMinutes(),
    dt.getSeconds(),
    dt.getMilliseconds()
  );
  return thdate;
}

/**
 * Interface for Item of Page Navigation
 */
export interface NavbarNavlink {
  Header: string;
  Link: string;
  Icon: FunctionComponent;
}

/**
 * Interface for Item of Project Navigation
 */
export interface NavbarProjNavlink {
  Header: string;
  Link: string;
}

/**
 * The Page Navbar Item
 */
export const navInfo: NavbarNavlink[] = [
  {
    Header: "Home",
    Link: "/home/status",
    Icon: () => <HomeIcon />,
  },
  {
    Header: "Search Projects",
    Link: "/search/projects",
    Icon: () => <SearchIcon />,
  },
  {
    Header: "Search Equipments",
    Link: "/search/equipments",
    Icon: () => <SearchIcon />,
  },
  {
    Header: "Add New Project",
    Link: "/create/projects",
    Icon: () => <AddIcon />,
  },
];

/**
 * The Project Navbar Item
 */
export const projectNavInfo: NavbarProjNavlink[] = [
  { Header: "Details", Link: "/project/projects" },
  { Header: "Files", Link: "/project/files" },
  { Header: "Equipments", Link: "/project/equipments" },
  { Header: "Stages", Link: "/project/stages" },
];

/**
 * For calculating difference between 2 datetimes
 * @param before the date that is supposed to come before
 * @param after the date that is supposed to come after
 * @returns the formatted result
 */
export function calculateDiffTime(before: Date, after: Date) {
  const _days = -dayjs(before).diff(dayjs(after), "days") + 1;
  let diffyear = after.getFullYear() - before.getFullYear();
  let diffmth = after.getMonth() - before.getMonth();
  let diffdt = after.getDate() - before.getDate() + 1;
  if (diffdt < 0) {
    diffdt += dayjs(
      new Date(after.getFullYear(), after.getMonth() - 1)
    ).daysInMonth();
    diffmth -= 1;
  }
  if (diffmth < 0) {
    diffmth += 12;
    diffyear -= 1;
  }
  if (diffyear < 0) {
    diffdt = diffmth = diffyear = 0;
  }
  return `${
    _days > 0 ? _days : 0
  } วัน (ประมาณ ${diffyear} ปี ${diffmth} เดือน ${diffdt} วัน) (รวมวันเริ่ม MA)`;
}

/**
 * Parse the string as a whole into an Integer.
 * @throws Input is not an Integer
 * @throws Input is more than MAX_SAFE_INTEGER
 * @param s the strnig to be parsed
 * @returns the integer if parsed successfully
 */
export function parseInteger(s: string) {
  const nm = Number(s);
  const nm2 = parseInt(s);
  if (nm > Number.MAX_SAFE_INTEGER) {
    throw new Error("Input is more than MAX_SAFE_INTEGER");
  }
  if (nm !== nm2) {
    throw new Error("Input is not an Integer");
  }
  if (isNaN(nm)) {
    throw new Error("Input is not an Integer");
  }
  return nm;
}

/**
 * Format date to HH-MM-SS-mmmm. The divider can be changed.
 * @param date The date Object
 * @param divider The thing that gets put between other thing
 * @returns The formatted string
 */
export function formatDateDDMMYY(date: Date, divider: string = "/") {
  return `${(date.getDate() + "").padStart(2, "0")}${divider}${(
    date.getMonth() +
    1 +
    ""
  ).padStart(2, "0")}${divider}${date.getFullYear() + 543}`;
}
