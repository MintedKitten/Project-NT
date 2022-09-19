/**
 * @file Frontend to Backend, Project Details Edit functions
 */
import { retDataeditproject } from "../../pages/api/edit/projects";
import { projectsInt } from "../db";
import { fetcher } from "../frontend";

/**
 * Update Project Details
 * @param pid The project id
 * @param query The details
 * @returns true if update is successful, otherwise false
 */
export async function updateProject(pid: string, query: projectsInt) {
  const data = (await fetcher("/api/edit/projects", {
    _id: pid,
    ...query,
  })) as retDataeditproject;
  return data;
}
