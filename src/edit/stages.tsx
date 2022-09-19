/**
 * @file Frontend to Backend, Project Stages Edit functions
 */
import { retDataeditstagefiles } from "../../pages/api/edit/stagefiles";
import { retDataeditstages } from "../../pages/api/edit/stages";
import { fetcher } from "../frontend";
import { StagesProgress } from "../local";

/**
 * Change stage status and date
 * @param stid The stage id
 * @param status The status to change to
 * @param date The date
 * @returns true if update is successful, otherwise false
 */
export async function editStageStatus(
  stid: string,
  status: StagesProgress,
  date: Date
) {
  const data = (await fetcher("/api/edit/stages", {
    stid: stid,
    status: status,
    date: date.toString(),
  })) as retDataeditstages;
  return data.isUpdateSuccesful;
}

/**
 * Remove a file from a stage
 * @param fileId The file id
 * @returns true if removal is successful, otherwise false
 */
export async function deleteStageFile(fileId: string) {
  const data = (await fetcher("/api/edit/stagefiles", {
    fileId: fileId,
  })) as retDataeditstagefiles;
  return data.isDeleteSuccessful;
}
