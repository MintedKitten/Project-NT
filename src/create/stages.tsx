/**
 * @file Frontend to Backend, Project Stages Create functions
 */
import { retDatacreatestages } from "../../pages/api/create/stages";
import { fetcher } from "../frontend";

/**
 * Add files id to stage
 * @param pid The project id
 * @param stid The stage id
 * @param fmids The files id array
 * @returns true if addition is successful, otherwise false
 */
export async function addFMidsToStage(
  pid: string,
  stid: string,
  fmids: string[]
) {
  const data = (await fetcher("/api/create/stages", {
    pid: pid,
    stid: stid,
    fmids: fmids,
  })) as retDatacreatestages;
  return data.isAllSuccessful;
}
