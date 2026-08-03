"use client";

import { useTransition } from "react";
import { deletePropertyImage } from "./actions";

export default function DeleteImageButton({
  imageId,
  propertyId,
}: {
  imageId: string;
  propertyId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm("Eliminare questa foto?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("image_id", imageId);
    formData.set("property_id", propertyId);
    startTransition(() => {
      deletePropertyImage(formData);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label="Elimina foto"
      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white transition hover:bg-sunset-600 disabled:opacity-50"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 6 18 18M18 6 6 18" />
      </svg>
    </button>
  );
}
