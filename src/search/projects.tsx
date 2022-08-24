import { ObjectId } from "bson";

export const typeArray = ["All", "จัดซื้อ", "จัดจ้าง", "จัดเช่า"];

export interface searchProjectsTableInt {
  id: ObjectId;
  name: string;
  year: number;
  type: number;
}


