import { retDataeditstagefiles } from "../../pages/api/edit/stagefiles";
import { retDataeditstages } from "../../pages/api/edit/stages";
import { fetcher } from "../frontend";
import { StagesProgress } from "../local";

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

export async function deleteStageFile(fileId: string) {
  const data = (await fetcher("/api/edit/stagefiles", {
    fileId: fileId,
  })) as retDataeditstagefiles;
  return data.isDeleteSuccessful;
}
