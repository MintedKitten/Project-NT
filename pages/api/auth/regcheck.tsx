import { NextApiRequest, NextApiResponse } from "next";
import { isUsernameExist } from "../../../src/auth";

/**
 * Api return type
 */
export type retDataregcheck = {
  isExist: boolean;
};

/**
 * Check if usernam ehas been taken
 * @param req
 * @param res
 * @returns
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: retDataregcheck }>
) {
  try {
    const body = JSON.parse(req.body);
    const isExist = await isUsernameExist(body.username);
    return res.status(200).json({ data: { isExist: isExist } });
  } catch (err) {
    return res.status(400).end();
  }
}

export default handler;
