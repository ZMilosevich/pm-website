import { useEffect, useState } from "react";

const second = 1_000;
const minute = 60 * second;
const day = 24 * 60 * minute;
const week = 7 * day;
const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "always" });

export function RunCountdown({ startsAt }: { startsAt: string }) {
  const startTime = Date.parse(startsAt);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!Number.isFinite(startTime)) return;

    let timeout: number | undefined;
    function tick() {
      const currentTime = Date.now();
      const remaining = startTime - currentTime;
      setNow(currentTime);
      if (remaining <= 0) return;

      const delay = remaining >= day
        ? Math.min(minute, remaining - day + 1)
        : Math.min(second, remaining);
      timeout = window.setTimeout(tick, delay);
    }

    tick();
    return () => window.clearTimeout(timeout);
  }, [startTime]);

  const remaining = startTime - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return null;

  if (remaining >= day) {
    const label = remaining >= 2 * week
      ? relativeTime.format(Math.floor(remaining / week), "week")
      : relativeTime.format(Math.ceil(remaining / day), "day");

    return <time className="run-kicker run-countdown" dateTime={startsAt}>{label}</time>;
  }

  const secondsLeft = Math.ceil(remaining / second);
  const hours = Math.floor(secondsLeft / 3_600);
  const minutes = Math.floor((secondsLeft % 3_600) / 60);
  const seconds = secondsLeft % 60;
  const clock = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");

  return (
    <time
      className="run-kicker run-countdown"
      dateTime={startsAt}
      role="timer"
      aria-label={`Starts in ${hours} hours, ${minutes} minutes, ${seconds} seconds`}
    >
      in {clock}
    </time>
  );
}
