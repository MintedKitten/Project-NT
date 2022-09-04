import dayjs from "dayjs";

export function calculateDiffTime(before: Date, after: Date) {
  const _days = -dayjs(before).diff(dayjs(after), "days");
  return `${after.getFullYear() - before.getFullYear()} ปี ${
    after.getMonth() - before.getMonth()
  } เดือน ${after.getDate() - before.getDate()} วัน (${_days} วัน)`;
}
