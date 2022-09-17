import { existsSync, mkdirSync } from "fs";
import { createLogger, transports, format } from "winston";
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

export function log(
  message: string,
  level: string = "info",
  date: Date = new Date()
) {
  const logDate = new Date();
  const datedir = formatDateDDMMYY(logDate, "-");
  if (!existsSync(logDir + "/" + datedir)) {
    mkdirSync(logDir + "/" + datedir, { recursive: true });
  }
  createLogger({
    format: format.json(),
    transports: new transports.File({
      filename: `${logDir}/${datedir}/${formatDateHHMMSSmmmm(logDate)}.log`,
    }),
  }).log({
    message: message,
    level: level,
    date: date.toISOString(),
  });
}
