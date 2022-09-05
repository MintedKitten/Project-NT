import { Filter } from "mongodb";
import { eqJoinProj, equipmentsInt, getMongoClient, projectsInt } from "./db";

export async function EquipmentWithProjectName(query: Filter<equipmentsInt>) {
  const conn = await getMongoClient();
  try {
    const result = await (
      await eqJoinProj(conn, query)
    )
      .project<equipmentsInt & projectsInt>({
        partNumber: 1,
        desc: 1,
        qty: 1,
        unit: 1,
        unitPrice: 1,
        projName: 1,
        projId: 1,
      })
      .toArray();
    return result;
  } catch (err) {
    return null;
  } finally {
    await conn.close();
  }
}
