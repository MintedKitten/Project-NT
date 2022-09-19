/**
 * @file Frontend to Backend, Project Equipments Edit functions
 */
 import { retEditequipments } from "../../pages/api/edit/equipments";
import { retEditequipmentsgroup } from "../../pages/api/edit/equipmentsgroup";
import { retDeleteequipmentsgroup } from "../../pages/api/edit/equipmentsgroupdelete";
import { rowCSVInt, rowInt } from "../create/equipments";
import { fetcher } from "../frontend";

/**
 * Update Equipments Groups and Equipments
 * @param pid The project id
 * @param eqgid The equipments group id
 * @param eqgName The equipments group name
 * @param eqgDesc The equipments group desc
 * @param eqgQty The equipments group qty
 * @param rows The equipments array
 * @returns true if both update are successful, otherwise false
 */
export async function editEquipmentGroupAndEquipments(
  pid: string,
  eqgid: string,
  eqgName: string,
  eqgDesc: string,
  eqgQty: number,
  rows: Readonly<rowInt[]>
) {
  const data = (await fetcher("/api/edit/equipmentsgroup", {
    pid: pid,
    eqgid: eqgid,
    eqgName: eqgName,
    eqgDesc: eqgDesc,
    eqgQty: eqgQty,
  })) as retEditequipmentsgroup;
  const qrows = rows.map((row) => {
    return rowToqrow(row);
  });
  const data2 = (await fetcher("/api/edit/equipments", {
    pid: pid,
    eqgId: eqgid,
    rows: qrows,
  })) as retEditequipments;
  return data.isUpdateSuccessful && data2.isEditSuccessful;
}

function rowToqrow(row: rowInt) {
  const ret: rowCSVInt = {
    partNumber: row.partNumber,
    desc: row.desc,
    qty: row.qty,
    uPrice: row.uPrice.toString(),
    unit: row.unit,
  };
  return ret;
}

/**
 * Remove an equipments group from project
 * @param eqgId The equipments group id
 * @returns true if removal is successful, otherwise false
 */
export async function equipmentsGroupDelete(eqgId: string) {
  const data = (await fetcher("/api/edit/equipmentsgroupdelete", {
    eqgId: eqgId,
  })) as retDeleteequipmentsgroup;
  return data.isDeleteSuccessful;
}
