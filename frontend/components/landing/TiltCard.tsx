"use client";

import { useRef } from "react";

/**
 * Effetto "tilt": la carta si inclina leggermente seguendo la posizione
 * del mouse, come nelle pagine prodotto Apple. Su touch (mobile) non fa
 * nulla di strano: semplicemente non riceve eventi di movimento del mouse,
 * quindi resta ferma — nessun comportamento strano da gestire.
 */
export default function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.015)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transition-transform duration-200 ease-out will-change-transform motion-reduce:transform-none"
    >
      {children}
    </div>
  );
}
