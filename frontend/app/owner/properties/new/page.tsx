import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import ListingPublishWizard from "@/components/owner/publish/ListingPublishWizard";
import BulkCsvImport from "@/components/owner/publish/BulkCsvImport";
import {
  canUseBulkListingImport,
  loadListingWizardDraft,
} from "../wizard-actions";

export const metadata: Metadata = {
  title: "Pubblica annuncio | Coabito",
};

type SearchParams = Promise<{ draft?: string }>;

export default async function NewOwnerPropertyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(["owner"]);
  const params = await searchParams;

  let initialDraft = null;
  if (params.draft) {
    const loaded = await loadListingWizardDraft(params.draft);
    if ("draft" in loaded) initialDraft = loaded.draft;
  }

  const bulk = await canUseBulkListingImport();

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/owner" className="text-sm text-ink-muted underline">
          ← Area proprietario
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          Pubblica un immobile
        </h1>
        <p className="mt-1 mb-6 text-sm text-ink-muted">
          Wizard guidato: indirizzo geocodificato, bozza salvata a ogni passo,
          descrizione con Vesta e anteprima come la vedranno studenti e
          lavoratori. Nessun riferimento fisso a una sola città.
        </p>

        {bulk.allowed && (
          <div className="mb-6">
            <BulkCsvImport initiallyAllowed />
          </div>
        )}

        <ListingPublishWizard
          initialDraft={initialDraft}
        />
      </div>
    </main>
  );
}
