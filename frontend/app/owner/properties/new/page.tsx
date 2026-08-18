import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import OwnerListingForm from "./OwnerListingForm";

export const metadata: Metadata = {
  title: "Nuovo immobile | Coabito",
};

export default async function NewOwnerPropertyPage() {
  await requireRole(["owner"]);

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <Link href="/owner" className="text-sm text-ink-muted underline">
          ← Area proprietario
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          Pubblica un immobile
        </h1>
        <p className="mt-1 mb-6 text-sm text-ink-muted">
          Marketplace: tu firmi direttamente con lo studente. Coabito fa matching e fiducia.
        </p>
        <OwnerListingForm />
      </div>
    </main>
  );
}
