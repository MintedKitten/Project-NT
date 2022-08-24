import { retDataeditproject } from "../../pages/api/edit/projects";
import { projectsInt } from "../db";
import { fetcher } from "../frontend";

export async function updateProject(pid: string, query: projectsInt) {
  const data = (await fetcher("/api/edit/projects", {
    _id: pid,
    ...query,
  })) as retDataeditproject;
  return data;
}
