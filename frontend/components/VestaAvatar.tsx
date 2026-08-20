"use client";

import { useEffect, useId, useState } from "react";

interface VestaAvatarProps {
  size?: number;
  className?: string;
  /**
   * `circle` — fiamma nel disco corallo (chat, header).
   * `flame` — solo fiamma, sfondo trasparente (su sfondi già colorati).
   */
  variant?: "circle" | "flame";
}

/**
 * Avatar di Vesta: fiamma con volto (dea del focolare).
 * Usa PNG pro in /public/images/ quando presenti (retina-ready);
 * altrimenti SVG con gradienti, ombra morbida e riflessi negli occhi.
 */
export default function VestaAvatar({
  size = 36,
  className = "",
  variant = "circle",
}: VestaAvatarProps) {
  const uid = useId().replace(/:/g, "");
  const pngSrc =
    variant === "flame"
      ? "/images/vesta-pro-flame.png"
      : "/images/vesta-pro-cerchio.png";
  const [usePng, setUsePng] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setUsePng(true);
    };
    img.onerror = () => {
      if (!cancelled) setUsePng(false);
    };
    img.src = pngSrc;
    return () => {
      cancelled = true;
    };
  }, [pngSrc]);

  if (usePng) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={pngSrc}
        alt=""
        width={size * 2}
        height={size * 2}
        decoding="async"
        className={`shrink-0 object-cover ${variant === "circle" ? "rounded-full" : ""} ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  const disc = `vestaDisc-${uid}`;
  const flameOuter = `vestaFlameOuter-${uid}`;
  const flameInner = `vestaFlameInner-${uid}`;
  const shadow = `vestaShadow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={disc} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FF8A6E" />
          <stop offset="55%" stopColor="#FF6B4A" />
          <stop offset="100%" stopColor="#E85A3C" />
        </radialGradient>
        <linearGradient id={flameOuter} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FFF5EB" />
          <stop offset="100%" stopColor="#FFE0C2" />
        </linearGradient>
        <linearGradient id={flameInner} x1="0.4" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#FFD56A" />
          <stop offset="55%" stopColor="#FFB13D" />
          <stop offset="100%" stopColor="#FF8F2A" />
        </linearGradient>
        <filter id={shadow} x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1.2"
            stdDeviation="1.1"
            floodColor="#0F2A2E"
            floodOpacity="0.22"
          />
        </filter>
      </defs>

      {variant === "circle" && (
        <circle cx="16" cy="16" r="16" fill={`url(#${disc})`} />
      )}

      <g filter={`url(#${shadow})`}>
        <path
          d="M16 5 C21 11 23 15 22 19 C21 24 18.5 27 16 27 C13.5 27 11 24 10 19 C9.5 16.5 10.5 13.5 12 11.5 C12.2 14.5 13.5 16 13.5 16 C13.2 12.5 14 9 16 5 Z"
          fill={`url(#${flameOuter})`}
        />
        <path
          d="M16 12 C18.5 15.5 19.5 18 18.8 20.5 C18.2 23 17 24.5 16 24.5 C15 24.5 13.8 23 13.2 20.5 C12.7 18.5 13.3 16.5 14.2 15 C14.3 17 15 17.8 15 17.8 C14.9 15.8 15.2 14 16 12 Z"
          fill={`url(#${flameInner})`}
        />
      </g>

      <circle cx="14.3" cy="19.5" r="0.95" fill="#0F2A2E" />
      <circle cx="17.7" cy="19.5" r="0.95" fill="#0F2A2E" />
      <circle cx="14.55" cy="19.25" r="0.28" fill="#FFFFFF" opacity="0.9" />
      <circle cx="17.95" cy="19.25" r="0.28" fill="#FFFFFF" opacity="0.9" />

      <path
        d="M14.5 21.5 Q16 23 17.5 21.5"
        stroke="#0F2A2E"
        strokeWidth="0.85"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
