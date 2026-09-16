"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

/** Live clock in David's timezone. Renders a placeholder on the server to avoid hydration drift. */
export function LocalTime({ className }: { className?: string }) {
  const [time, setTime] = useState<string>("--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: site.timezone,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className={className} suppressHydrationWarning>
      {time} COT
    </time>
  );
}
