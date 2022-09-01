import { retDatacreatefiles } from "../../pages/api/create/files";
import { retDataeditfiles } from "../../pages/api/edit/files";
import { fetcher, rawfetcher } from "../frontend";

export async function uploadToServer(
  formData: FormData,
  cb: (byteLoad: number, byteSent: number) => void
) {
  const data = await rawfetcher("/files/", formData, (ld, tl) => {
    cb(ld, tl);
  });
  return data.reponse as { fmid: string };
}

export async function addFMidsToProject(pid: string, fmids: string[]) {
  const data = (await fetcher("/api/create/files", {
    pid: pid,
    fmids: fmids,
  })) as retDatacreatefiles;
  return data.isAllSuccessful;
}

export async function deleteFileFromProject(fileId: string) {
  const data = (await fetcher("/api/edit/files", {
    fileId: fileId,
  })) as retDataeditfiles;
  return data.isDeleteSuccessful;
}
