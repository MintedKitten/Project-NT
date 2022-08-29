import { ObjectId } from "bson";
import { retCreateequipmentsgroup } from "../../pages/api/create/equipmentsgroup";
import { fetcher } from "../frontend";

export interface rowInt {
  id: string;
  eqid: ObjectId;
  partNumber: string;
  desc: string;
  qty: number;
  uPrice: number;
  isNew?: boolean;
  isToSave?: boolean;
}

export async function addEquipmentGroupAndEquipments(
  pid: string,
  eqgName: string,
  eqgDesc: string,
  eqgQty: number,
  rows: rowInt[]
) {
  const data = (await fetcher("/api/create/equipmentsgroup", {
    pid: pid,
    eqgName: eqgName,
    eqgDesc: eqgDesc,
    eqgQty: eqgQty,
  })) as retCreateequipmentsgroup;
  const eqgId = data.eqgId;
  const data2 = await fetcher("/api/create/equipments", {
    eqgId: eqgId,
    rows: rows,
  });
}
