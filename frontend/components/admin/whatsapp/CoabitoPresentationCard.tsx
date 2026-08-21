"use client";

import { useCallback, useState } from "react";
import { Download, Eye, Share2, Copy, Check } from "lucide-react";

/**
 * Materiale di presentazione Coabito per operatori.
 * Asset sostituibile: /public/assets/coabito-presentation.svg
 * (oppure .png con lo stesso basename).
 */
const ASSET_PATH = "/assets/coabito-presentation.svg";
const ASSET_DOWNLOAD_NAME = "coabito-presentation.svg";

export default function CoabitoPresentationCard({
  className = "",
}: {
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const absoluteUrl =
    typeof window !== "undefined"
      ? new URL(ASSET_PATH, window.location.origin).toString()
      : ASSET_PATH;

  const handleView = () => {
    window.open(ASSET_PATH, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = ASSET_PATH;
    a.download = ASSET_DOWNLOAD_NAME;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShare = useCallback(async () => {
    setShareError(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Coabito — Trova casa. Trova il coinquilino giusto.",
          text: "Coabito — Trova casa. Trova il coinquilino giusto.",
          url: absoluteUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Condivisione non disponibile su questo dispositivo.");
    }
  }, [absoluteUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Impossibile copiare il link.");
    }
  }, [absoluteUrl]);

  return (
    <section
      className={`rounded-xl2 bg-surface p-5 shadow-card ${className}`}
    >
      <h2 className="font-display text-sm font-bold text-ink">
        Materiale di presentazione
      </h2>
      <p className="mt-1 text-xs text-ink-muted">
        Banner da mostrare o condividere durante il contatto. Sostituisci il
        file in <code className="text-[11px]">public/assets/</code> quando
        hai l&apos;asset definitivo.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-sea-100 bg-gradient-to-br from-sea-50 to-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ASSET_PATH}
          alt="Coabito — Trova casa. Trova il coinquilino giusto."
          className="h-auto w-full object-cover"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleView}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-sea-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-sea-700"
        >
          <Eye size={14} />
          Visualizza
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-sea-50 px-3.5 py-2 text-xs font-semibold text-sea-700 transition hover:bg-sea-100"
        >
          <Share2 size={14} />
          Condividi
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-sea-50 px-3.5 py-2 text-xs font-semibold text-sea-700 transition hover:bg-sea-100"
        >
          <Download size={14} />
          Scarica
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-sea-100 bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-sea-50"
        >
          {copied ? <Check size={14} className="text-sea-600" /> : <Copy size={14} />}
          {copied ? "Copiato" : "Copia link"}
        </button>
      </div>
      {shareError && (
        <p className="mt-2 text-xs text-sunset-600">{shareError}</p>
      )}
    </section>
  );
}
