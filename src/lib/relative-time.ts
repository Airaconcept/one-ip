import {
  format,
  formatDistanceStrict,
  isValid,
  parseISO,
  subMonths,
} from "date-fns";
import { enUS, zhCN } from "date-fns/locale";

export function formatRelativeTime(
  value: string,
  now = new Date(),
  locale = "zh-CN",
) {
  const date = parseISO(value);
  if (!isValid(date)) return "—";
  if (date < subMonths(now, 1) || date > now)
    return format(date, "yyyy-MM-dd HH:mm");
  return formatDistanceStrict(date, now, {
    addSuffix: true,
    roundingMethod: "floor",
    locale: locale === "zh-CN" ? zhCN : enUS,
  });
}
