"use client";

import { useState, useTransition } from "react";
import { createPostAction } from "@/app/community/actions";

export default function CommunityComposer({ groupId }: { groupId: string }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="rounded-xl2 border border-sea-100 bg-white p-4 shadow-card"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await createPostAction({ groupId, content });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setContent("");
        });
      }}
    >
      <label className="block text-xs font-medium text-ink-muted">
        Scrivi sulla bacheca
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={1000}
          required
          placeholder="Es. Arrivo a settembre, cerco tip sul quartiere vicino a Monte Dago…"
          className="mt-1 w-full rounded-xl border border-sea-100 px-3 py-2 text-sm text-ink focus:border-sea-400 focus:outline-none"
        />
      </label>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10px] text-ink-muted">{content.length}/1000</span>
        <button
          type="submit"
          disabled={pending || content.trim().length < 1}
          className="rounded-full bg-sunset-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sunset-600 disabled:opacity-50"
        >
          {pending ? "Pubblicazione…" : "Pubblica"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-sunset-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
