import { rawfetcher } from "../frontend";

export async function uploadToServer(
  formData: FormData,
  cb: (byteLoad: number, byteSent: number) => void
) {
  const data = await rawfetcher("/files/", formData, (ld, tl) => {
    cb(ld, tl);
  });
  return data as { fmid: string };
  //   return { fmid: idstring };
}
