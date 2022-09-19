/**
 * @file For frontend talking to backend
 */
import { retDatasignup } from "../pages/api/auth/signup";
import { retDataregcheck } from "../pages/api/auth/regcheck";

/**
 * For uploading files
 * @param apiurl api path
 * @param body body of the request
 * @param cb call back. For uploading percentages
 * @returns the response from api, and if upload is successful
 */
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

/**
 * For fetching to backend
 * @param apiurl api path
 * @param body body of the request
 * @returns the response from api
 */
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

/**
 * Register, if username already exists
 * @param username the username to check
 * @returns true if username already exists, otherwise false
 */
export async function callRegcheck(username: string) {
  const data = (await fetcher("/api/auth/regcheck", {
    username: username,
  })) as retDataregcheck;
  return data.isExist;
}

/**
 * Register, create new account
 * @param username the username
 * @param password the password
 * @param name the name of the account
 * @returns true if account is created, otherwise false
 */
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
