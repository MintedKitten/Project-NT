import { NextApiRequest, NextApiResponse } from "next";
import { createNewUser, hashPassword } from "../../../src/auth";
import { log } from "../../../src/logger";

export type retDatasignup = {
  isComplete: boolean;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: retDatasignup }>
) {
  try {
    const body = JSON.parse(req.body);
    const isComplete = await createNewUser(
      body.username,
      hashPassword(body.username, body.password),
      body.name
    );
    log(
      JSON.stringify({
        msg: "Attempt new sign up",
        user: body.name,
        rawheader: req.rawHeaders,
        isComplete: isComplete,
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
