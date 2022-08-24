import { retDatasignup } from "../pages/api/auth/signup";
import { retDataregcheck } from "../pages/api/auth/regcheck";

async function fetcher(apiurl: string, body: object) {
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
