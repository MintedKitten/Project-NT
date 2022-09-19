/**
 * @file The Logger. Made with Winston
 */
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

/**
 * Format date to HH-MM-SS-mmmm. The divider can be changed.
 * @param date The date Object
 * @param divider The thing that gets put between other thing
 * @returns The formatted string
 */
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

/**
 * Create a log file.
 * @param message The message
 * @param level The level of logging of the message
 * @param date The timestamp of the message
 */
export function log(
  message: string,
  level: string = "info",
  date: Date = new Date()
) {
  const datedir = formatDateDDMMYY(date, "-");
  if (!existsSync(logDir + "/" + datedir)) {
    mkdirSync(logDir + "/" + datedir, { recursive: true });
  }
  createLogger({
    format: format.json(),
    transports: new transports.File({
      filename: `${logDir}/${datedir}/${formatDateHHMMSSmmmm(date)}.log`,
    }),
  }).log({
    message: message,
    level: level,
    date: date.toISOString(),
  });
}
