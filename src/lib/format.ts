import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export function formatDuration(seconds: number | null): string {
  if (seconds == null) {
    return "";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatMinutes(seconds: number): string {
  const total = Math.round(seconds / 60);
  if (total < 60) {
    return `${total}m`;
  }
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatCount(n: number | null): string {
  if (n == null) {
    return "";
  }
  if (n >= 1e9) {
    return `${trim(n / 1e9)}B`;
  }
  if (n >= 1e6) {
    return `${trim(n / 1e6)}M`;
  }
  if (n >= 1e3) {
    return `${trim(n / 1e3)}K`;
  }
  return n.toString();
}

function trim(x: number): string {
  return x.toFixed(1).replace(/\.0$/, "");
}

export function formatDate(ymd: string | null): string {
  if (!ymd) {
    return "";
  }
  return dayjs(ymd, "YYYYMMDD").format("MMM D, YYYY");
}
