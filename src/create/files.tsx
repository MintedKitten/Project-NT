/**
 * @file Frontend to Backend, Project Stages Create functions
 */
import { retDatacreatefiles } from "../../pages/api/create/files";
import { retDataeditfiles } from "../../pages/api/edit/files";
import { fetcher, rawfetcher } from "../frontend";

/**
 * Upload file to file server
 * @param formData The file in formData
 * @param cb The callback upload progress
 * @returns The response from file server
 */
export async function uploadToServer(
  formData: FormData,
  cb?: (sentByte: number, totalByte: number) => void
) {
  const data = await rawfetcher("/files/", formData, (ld, tl) => {
    if (cb) {
      cb(ld, tl);
    }
  });
  return data.response as { fmid: string };
}

/**
 * Add files id to project
 * @param pid The project id
 * @param fmids The files id array
 * @returns true if addition is successful, otherwise false
 */
export async function addFMidsToProject(pid: string, fmids: string[]) {
  const data = (await fetcher("/api/create/files", {
    pid: pid,
    fmids: fmids,
  })) as retDatacreatefiles;
  return data.isAllSuccessful;
}

/**
 * Remove file from project
 * @param fileId The file id
 * @returns true if removal is successful, otherwise false
 */
export async function deleteFileFromProject(fileId: string) {
  const data = (await fetcher("/api/edit/files", {
    fileId: fileId,
  })) as retDataeditfiles;
  return data.isDeleteSuccessful;
}
