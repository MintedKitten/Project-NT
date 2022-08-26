import { retDatacreatestages } from "../../pages/api/create/stages";
import { fetcher } from "../frontend";

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
