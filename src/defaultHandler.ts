import { existsSync, mkdirSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import nextConnect from "next-connect";
import { createLogger, transports, format } from "winston";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { formatDateDDMMYY } from "./local";

if (!process.env.LOG_DIR) {
  console.log(
    "Environment LOG_DIR is not defined. Default directory will be used."
  );
}
// Log directory
const logDir = process.env.LOG_DIR || process.cwd() + "/log";

function formatDateHHMMSSmmmm(date: Date, divider: string = "-") {
  return `${(date.getHours() + "").padStart(2, "0")}${divider}${(
    date.getMinutes() +
    1 +
    ""
  ).padStart(2, "0")}${divider}${(date.getSeconds() + "").padStart(
    2,
    "0"
  )}${divider}${(date.getMilliseconds() + "").padStart(4, "0")}`;
}

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
    const logDate = new Date();
    const datedir = formatDateDDMMYY(logDate, "-");
    if (!existsSync(logDir + "/" + datedir)) {
      mkdirSync(logDir + "/" + datedir, { recursive: true });
    }
    const toLog = {
      uid: session.id,
      user: session.user?.name,
      rawheader: req.rawHeaders,
      apiurl: req.url,
      body: JSON.parse(req.body),
    };
    createLogger({
      format: format.json(),
      transports: new transports.File({
        filename: `${logDir}/${datedir}/${formatDateHHMMSSmmmm(logDate)}.log`,
      }),
    }).log({
      message: JSON.stringify(toLog),
      level: "info",
      date: new Date().toISOString(),
    });
    next();
  });
};
export { nxcHandler };
