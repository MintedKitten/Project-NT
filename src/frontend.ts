import { retDatasignup } from "../pages/api/auth/signup";
import { retDataregcheck } from "../pages/api/auth/regcheck";

export async function rawfetcher(
  apiurl: string,
  body: FormData,
  cb: (sentByte: number, totalByte: number) => void
) {
  const xhr = new XMLHttpRequest();
  let response: any = null;
  xhr.responseType = "json";

  const isSuccess = await new Promise<boolean>((resolve) => {
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        cb(event.loaded, event.total);
      }
    });
    xhr.addEventListener("loadend", () => {
      response = xhr.response;
      resolve(xhr.readyState === 4 && xhr.status === 201);
    });

    xhr.open("POST", apiurl, true);
    xhr.send(body);
  });
  return { response: response.data, isSuccess: isSuccess };
}

export async function fetcher(apiurl: string, body: object) {
  return await fetch(apiurl, {
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((res) => {
      return res.json();
    })
    .then((json: { data: any }) => {
      return json.data;
    });
}

export async function callRegcheck(username: string) {
  const data = (await fetcher("/api/auth/regcheck", {
    username: username,
  })) as retDataregcheck;
  return data.isExist;
}

export async function callAuthSignup(
  username: string,
  password: string,
  name: string
) {
  const data = (await fetcher("/api/auth/signup", {
    username: username,
    password: password,
    name: name,
  })) as retDatasignup;
  return data.isComplete;
}
