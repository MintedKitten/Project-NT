import { decode } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { createNewUser, hashPassword } from "../../../src/auth";
import { log } from "../../../src/logger";

/**
 * Api return type
 */
export type retDatasignup = {
  isComplete: boolean;
};

/**
 * Create new user
 * @param req
 * @param res
 * @returns
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: retDatasignup }>
) {
  try {
    const body = JSON.parse(req.body);
    const username = body.username;
    const passwordToken = decode(body.password) as {
      password: string;
      sub: string;
      date: string;
    };
    const password = passwordToken.password;
    const name = body.name;
    const isComplete = await createNewUser(
      username,
      hashPassword(username, password),
      name
    );
    log(
      JSON.stringify({
        msg: "Attempt new sign up",
        user: name,
        rawheader: req.rawHeaders,
        isComplete: isComplete,
        pwdToken: { sub: passwordToken.sub, date: passwordToken.date },
      })
    );
    return res.status(200).json({
      data: {
        isComplete: isComplete,
      },
    });
  } catch (err) {
    return res.status(400).end();
  }
}

export default handler;
