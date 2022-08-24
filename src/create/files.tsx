import { fetcher } from "../frontend";

export async function uploadInProject(formData: FormData) {
  const data = await fetcher("/files/", formData);
  //   return { fmid: idstring };
}
