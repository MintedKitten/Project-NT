/**
 * @file Default backend request handler
 */
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import nextConnect from "next-connect";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { log } from "./logger";

/**
 * The default handler.
 * Handles page checking and error.
 * Handles authentication and logging.
 */
const nxcHandler = () => {
  return nextConnect<NextApiRequest, NextApiResponse>({
    onError: (err, req, res, next) => {
      console.log(err);
      res.status(500).end("Error, Something went wrong");
    },
    onNoMatch: (req, res) => {
      res.status(404).end("Page is not found");
    },
  }).use(async (req, res, next) => {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).end();
    }
    const toLog = {
      msg: "Api is accessed",
      uid: session.id,
      user: session.user?.name,
      rawheader: req.rawHeaders,
      apiurl: req.url,
      body: JSON.parse(req.body),
    };
    log(JSON.stringify(toLog));
    next();
  });
};
export { nxcHandler };
