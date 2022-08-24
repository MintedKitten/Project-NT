import { fetcher } from "../frontend";

export async function uploadInProject(pid: string, formData: FormData) {
  const data = await fetcher("/files/", { _id: pid, frData: formData });
  //   return { fmid: idstring };
}
