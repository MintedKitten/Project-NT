import {
  Search as SearchIcon,
  Add as AddIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { FunctionComponent } from "react";

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

const thaiLetters = `_%ๅ+/๑-๒ภ๓ถ๔฿ค๕ต๖จ๗ข๘ช๙ๆ๐ไ"ำฎพฑะธรณนฯยญบฐล,ฃฅฟฤหฆกฏดโเฌาษสศวซง.ผ(ป)แฉอฮท?มฒใฬฝฦ`;
const engLetters = `~!1@2#3$4%5^6&7*8(9)0_-+=QqWwEeRrTtYyUuIiOoPp{[}]AaSsDdFfGgHhJjKkLl:;"'ZzXxCcVvBbNnMm<,>.?/`;

export function getLength(msg: string) {
  let count = 0;
  for (let index = 0; index < msg.length; index++) {
    if (
      thaiLetters.indexOf(msg.charAt(index)) > -1 ||
      engLetters.indexOf(msg.charAt(index)) > -1
    ) {
      count += 1;
    }
  }
  return count;
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
    Link: "/home/",
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
