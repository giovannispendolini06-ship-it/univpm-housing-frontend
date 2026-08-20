"use client";

import { useEffect } from "react";
import ServerErrorContent from "@/components/ServerErrorContent";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return <ServerErrorContent reset={reset} />;
}
