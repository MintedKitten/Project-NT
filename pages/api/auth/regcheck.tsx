import { NextApiRequest, NextApiResponse } from "next";
import { isUsernameExist } from "../../../src/auth";

export type retDataregcheck = {
  isExist: boolean;
};

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
