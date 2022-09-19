/**
 * @file Frontend to Backend, Project Equipments Create functions
 */
import Big from "big.js";
import { ObjectId } from "bson";
import { retDatacreateequipments } from "../../pages/api/create/equipments";
import { retCreateequipmentsgroup } from "../../pages/api/create/equipmentsgroup";
import { fetcher } from "../frontend";

/**
 * Definition of equipments in input form
 */
export interface rowInt {
  id: string;
  eqid?: ObjectId;
  partNumber: string;
  desc: string;
  qty: number;
  unit: string;
  uPrice: Big;
  isNew?: boolean;
  isToSave?: boolean;
}

/**
 * Default value for starting adding a new equipment
 */
export class rowClass implements rowInt {
  id: string = "";
  eqid?: ObjectId | undefined;
  partNumber!: string;
  desc: string = "";
  qty: number = 0;
  unit: string = "";
  uPrice: Big = Big(0);
  isNew?: boolean | undefined;
  isToSave?: boolean | undefined;
}

/**
 * Definition for Importing from CSV file: Equipments
 */
export interface rowCSVInt {
  partNumber: string;
  desc: string;
  qty: number;
  unit: string;
  uPrice: string;
}

/**
 * Class for validating imported CSV file columns: Equipments
 */
export class rowCSVClass implements rowCSVInt {
  partNumber: string = "";
  desc: string = "";
  qty: number = 0;
  unit: string = "";
  uPrice: string = "";
}

/**
 * Add equipments group and equipments
 * @param pid The project id
 * @param eqgName The equipments group name
 * @param eqgDesc The equipments group desc
 * @param eqgQty The equipments group qty
 * @param rows The equipments array
 * @returns true if addition is successful, otherwise false
 */
export async function addEquipmentGroupAndEquipments(
  pid: string,
  eqgName: string,
  eqgDesc: string,
  eqgQty: number,
  rows: Readonly<rowInt[]>
) {
  const data = (await fetcher("/api/create/equipmentsgroup", {
    pid: pid,
    eqgName: eqgName,
    eqgDesc: eqgDesc,
    eqgQty: eqgQty,
  })) as retCreateequipmentsgroup;
  const eqgId = data.eqgId;
  const qrows = rows.map((row) => {
    return rowToqrow(row);
  });
  const data2 = (await fetcher("/api/create/equipments", {
    pid: pid,
    eqgId: eqgId,
    rows: qrows,
  })) as retDatacreateequipments;
  return data2.isCreateSuccessful;
}

function rowToqrow(row: rowInt) {
  const ret: rowCSVInt = {
    partNumber: row.partNumber,
    desc: row.desc,
    qty: row.qty,
    unit: row.unit,
    uPrice: row.uPrice.toString(),
  };
  return ret;
}
