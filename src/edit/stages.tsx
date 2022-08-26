import { retDataeditstages } from "../../pages/api/edit/stages";
import { fetcher } from "../frontend";
import { StagesProgress } from "../local";

export async function editStageStatus(stid: string, status: StagesProgress) {
  const data = (await fetcher("/api/edit/stages", {
    stid: stid,
    status: status,
  })) as retDataeditstages;
  return data.isUpdateSuccesful;
}
