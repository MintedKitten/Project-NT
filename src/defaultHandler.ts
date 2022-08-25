import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import nextConnect from "next-connect";
import { authOptions } from "./auth";

// export interface NextApiRequestExtended
//   extends NextApiRequest,
//     userprofiletokenInt {}

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
    next();
  });
};
export { nxcHandler };
