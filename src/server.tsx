/**
 * @file Server Side File. Can only be imported and used server-sided.
 */
import { AggregationCursor, Filter, MongoClient } from "mongodb";
import {
  eqJoinProj,
  equipmentsInt,
  projectsInt,
  projJoinStage,
  stagesInt,
} from "./db";

/**
 * Left join Equipments to Project, and return the equipments details plus the project name. Made for Search Equipments Page
 * @param conn The MongoClient Connection
 * @param query The query that filter the result
 * @returns An array of the result
 */
export async function EquipmentWithProjectName(
  conn: MongoClient,
  query: Filter<equipmentsInt>
) {
  let ret: AggregationCursor<Partial<equipmentsInt & projectsInt>> | null =
    null;

  const result = (await eqJoinProj(conn, query)).project<
    Partial<equipmentsInt & projectsInt>
  >({
    partNumber: 1,
    desc: 1,
    qty: 1,
    unit: 1,
    unitPrice: 1,
    projName: 1,
    projId: 1,
  });
  ret = result;
  return ret;
}

/**
 * Left join Projects to Stages, and return the projects details plus the in-progress stages. Made for Pages that need to check the stage status
 * @param conn The MongoClient Connection
 * @param query The query that filter the result
 * @returns An array of the result
 */
export async function ProjectWithInProgressStage(
  conn: MongoClient,
  query: Filter<projectsInt>
) {
  let ret: AggregationCursor<
    projectsInt & {
      stages_docs: stagesInt[];
    }
  > | null = null;
  const result = (await projJoinStage(conn, query)).project<
    projectsInt & { stages_docs: stagesInt[] }
  >({
    projName: 1,
    type: 1,
    systemCount: 1,
    budget: 1,
    budgetType: 1,
    procurementYear: 1,
    contractstartDate: 1,
    contractendDate: 1,
    mastartDate: 1,
    maendDate: 1,
    comments: 1,
    stages_docs: 1,
  });
  ret = result;
  return ret;
}
