import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import customParseFormatPlugin from "dayjs/plugin/customParseFormat";
import localizedFormatPlugin from "dayjs/plugin/localizedFormat";
import isBetweenPlugin from "dayjs/plugin/isBetween";
dayjs.extend(buddhistEra);
dayjs.extend(customParseFormatPlugin);
dayjs.extend(localizedFormatPlugin);
dayjs.extend(isBetweenPlugin);

import "dayjs/locale/th";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateIOFormats } from "@date-io/core/IUtils";

interface newDateIOFormats<TLibFormatToken = string>
  extends DateIOFormats<TLibFormatToken> {
  keyboardDateBuddhist: TLibFormatToken;
}

interface Opts {
  locale?: string;
  /** Make sure that your dayjs instance extends customParseFormat and advancedFormat */
  instance?: typeof dayjs;
  formats?: Partial<newDateIOFormats>;
}

type Dayjs = dayjs.Dayjs;

const defaultFormats: newDateIOFormats = {
  normalDateWithWeekday: "ddd, MMM D",
  normalDate: "D MMMM",
  shortDate: "MMM D",
  monthAndDate: "MMMM D",
  dayOfMonth: "D",
  year: "YYYY",
  month: "MMMM",
  monthShort: "MMM",
  monthAndYear: "MMMM YYYY",
  weekday: "dddd",
  weekdayShort: "ddd",
  minutes: "mm",
  hours12h: "hh",
  hours24h: "HH",
  seconds: "ss",
  fullTime: "LT",
  fullTime12h: "hh:mm A",
  fullTime24h: "HH:mm",
  fullDate: "ll",
  fullDateWithWeekday: "dddd, LL",
  fullDateTime: "lll",
  fullDateTime12h: "ll hh:mm A",
  fullDateTime24h: "ll HH:mm",
  keyboardDate: "L",
  keyboardDateTime: "L LT",
  keyboardDateTime12h: "L hh:mm A",
  keyboardDateTime24h: "L HH:mm",
  keyboardDateBuddhist: "DD/MM/BBBB",
};

// Class
export class ThaiAdapterDayjs<
  TDate extends Dayjs = Dayjs
> extends AdapterDayjs {
  constructor({ formats }: Opts = {}) {
    super({
      locale: "th",
      formats: Object.assign({}, defaultFormats, formats),
      instance: dayjs,
    });
  }

  public getYear = (date: Dayjs): number => {
    // When event get the year
    return date.year();
  };

  public setYear = (date: Dayjs, year: number) => {
    // When render set the display year
    return date.set("year", year) as TDate;
  };

  public startOfMonth = (date: Dayjs) => {
    // Correction
    // date fromDesktopPicker and MobilePicker
    // has type Date
    return dayjs(date).startOf("month") as TDate;
  };

  public isBefore = (date: Dayjs, value: Dayjs) => {
    // Correction
    // date fromDesktopPicker and MobilePicker
    // has type Date
    return dayjs(date).isBefore(value);
  };

  public isAfter = (date: Dayjs, value: Dayjs) => {
    // Correction
    // date fromDesktopPicker and MobilePicker
    // has type Date
    return dayjs(date).isAfter(value);
  };
}
