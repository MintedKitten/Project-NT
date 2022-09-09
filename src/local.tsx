import {
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { FunctionComponent } from "react";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
dayjs.extend(buddhistEra);

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

export enum StagesProgress {
  OnGoing,
  Complete,
}
export enum DateDeadlineStatus {
  Normal,
  Complete,
  RedAlert,
  Passed,
  PastDue,
}

export const budgetThreshold = 100000000;

// For reference
const tops = [
  "รายการโครงการจัดซื้อจัดจ้าง",
  "ประเภทโครงการ",
  "จำนวนหน่วย",
  "งบประมาณ (ไม่รวมภาษีมูลค่าเพิ่ม) (บาท)",
  "ประเภทขั้นตอน",
  "งบประมาณ (รวมภาษีมูลค่าเพิ่ม) (บาท)",
  "ประเภทงบประมาณ",
  "ปีที่ดำเนินการจัดซื้อจัดจ้าง (พ.ศ.)",
  "วันเริ่มสัญญา (พ.ศ.)",
  "วันหมดสัญญา (พ.ศ.)",
  "วันเริ่ม MA (พ.ศ.)",
  "วันหมดอายุ MA (พ.ศ.)",
  "MA (ระยะเวลารับประกัน)",
  "หมายเหตุ",
];

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

export const stageNames = [stageType1, stageType2];

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

export interface NavbarNavlink {
  Header: string;
  Link: string;
  Icon: FunctionComponent;
}

export interface NavbarProjNavlink {
  Header: string;
  Link: string;
}

export const navInfo: NavbarNavlink[] = [
  {
    Header: "Home",
    Link: "/home/alert",
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

export const projectNavInfo: NavbarProjNavlink[] = [
  { Header: "Details", Link: "/project/projects" },
  { Header: "Files", Link: "/project/files" },
  { Header: "Equipments", Link: "/project/equipments" },
  { Header: "Stages", Link: "/project/stages" },
];

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
  return `${_days} วัน (ประมาณ ${diffyear} ปี ${diffmth} เดือน ${diffdt} วัน) (รวมวันเริ่ม MA)`;
}

export function parseInteger(s: string) {
  const nm = Number(s);
  const nm2 = parseInt(s);
  if (nm > Number.MAX_SAFE_INTEGER) {
    throw new Error("Error: input is more than MAX_SAFE_INTEGER");
  }
  if (nm !== nm2) {
    throw new Error("Error: input is not an Integer");
  }
  if (isNaN(nm)) {
    throw new Error("Error: input is not an Integer");
  }
  if (!Number.isInteger(nm)) {
    throw new Error("Error: input is not an Integer");
  }
  return nm;
}

export function formatDateDDMMYY(date: Date) {
  return `${(date.getDate() + "").padStart(2, "0")}/${(
    date.getMonth() +
    1 +
    ""
  ).padStart(2, "0")}/${date.getFullYear() + 543}`;
}

export function formatDateYYYYMM(date: Date) {
  const dt = dayjs(date).locale("th");
  return dt.format("MMMM(MM) BBBB");
}
