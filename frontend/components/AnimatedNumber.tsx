"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

/**
 * Conta verso l'alto da 0 al valore vero quando compare a schermo,
 * invece di apparire già scritto — un dettaglio che i dashboard più
 * curati usano sempre per far "sentire" i numeri, non solo leggerli.
 */
export default function AnimatedNumber({
  value,
  suffix = "",
  duration = 800,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    let frame: number;

    function step(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad: parte veloce, rallenta verso la fine — più naturale
      // di una crescita lineare.
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <>
      {display.toLocaleString("it-IT")}
      {suffix}
    </>
  );
}
