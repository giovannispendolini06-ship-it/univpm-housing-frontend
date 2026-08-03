import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { uploadPropertyImages, assignPropertyOwner } from "../actions";
import DeleteImageButton from "../DeleteImageButton";
import DeletePropertyButton from "../DeletePropertyButton";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // --- Verifica accesso: solo admin -----------------------------------------
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  // --- Dati --------------------------------------------------------------
  const db = createServiceSupabaseClient();

  const { data: property } = await db
    .from("properties")
    .select("*, rooms(*)")
    .eq("id", id)
    .single();

  if (!property) notFound();

  const { data: currentOwnerAccount } = await db
    .from("users")
    .select("email, role, full_name")
    .eq("id", property.owner_id)
    .single();

  const isAssignedToRealOwner = currentOwnerAccount?.role === "owner";

  const { data: images } = await db
    .from("property_images")
    .select("*")
    .eq("property_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-dvh bg-bg px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <a
          href="/admin/properties"
          className="mb-4 inline-block text-sm text-ink-muted underline underline-offset-2"
        >
          ← Torna agli immobili
        </a>

        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">
              {property.address}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {property.zone ?? "Zona non specificata"} · {property.city} ·{" "}
              {property.monthly_rent_to_owner}€/mese al proprietario
            </p>
          </div>
          <DeletePropertyButton propertyId={property.id} />
        </div>

        {/* --- Proprietario --- */}
        <section className="mb-6 rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-1 font-display text-base font-bold text-ink">
            Proprietario
          </h2>

          {isAssignedToRealOwner ? (
            <p className="mb-4 rounded-lg bg-sea-50 px-3 py-2 text-sm text-sea-700">
              ✓ Collegato all&apos;account di {currentOwnerAccount?.full_name} (
              {currentOwnerAccount?.email}) — può vedere questo immobile nella
              sua area riservata.
            </p>
          ) : (
            <p className="mb-4 rounded-lg bg-sand-400/15 px-3 py-2 text-sm text-ink">
              Non ancora collegato a un account reale. Contatti che hai
              salvato: {property.owner_contact_name || "—"}
              {property.owner_contact_phone ? ` · ${property.owner_contact_phone}` : ""}
              {property.owner_contact_email ? ` · ${property.owner_contact_email}` : ""}
            </p>
          )}

          <form action={assignPropertyOwner} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="property_id" value={property.id} />
            <input
              type="email"
              name="owner_email"
              required
              defaultValue={property.owner_contact_email ?? ""}
              placeholder="Email con cui il proprietario si è registrato"
              className="min-w-[240px] flex-1 rounded-xl border border-sea-100 px-3 py-2 text-sm focus:border-sea-400 focus:outline-none"
            />
            <SubmitButton className="rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
              {isAssignedToRealOwner ? "Ricollega" : "Collega account"}
            </SubmitButton>
          </form>
          <p className="mt-2 text-[11px] text-ink-muted">
            Il proprietario deve essersi già registrato sul sito scegliendo
            &quot;Sono proprietario&quot; prima che tu possa collegarlo qui.
          </p>
        </section>

        {/* --- Foto --- */}
        <section className="mb-6 rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-4 font-display text-base font-bold text-ink">
            Foto
          </h2>

          {images && images.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={property.address}
                    className="h-full w-full object-cover"
                  />
                  <DeleteImageButton imageId={image.id} propertyId={property.id} />
                </div>
              ))}
            </div>
          )}

          <form action={uploadPropertyImages} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="property_id" value={property.id} />
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              required
              className="text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-sea-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sea-700"
            />
            <SubmitButton className="rounded-full bg-sea-600 px-4 py-2 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
              Carica foto
            </SubmitButton>
          </form>
          <p className="mt-2 text-[11px] text-ink-muted">
            Puoi selezionare più foto insieme. Formati supportati: JPG, PNG, WEBP.
          </p>
        </section>

        {/* --- Stanze --- */}
        <section className="rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-3 font-display text-base font-bold text-ink">
            Stanze
          </h2>
          <div className="space-y-2">
            {(property.rooms ?? []).map(
              (room: { id: string; room_label: string; price_monthly: number; is_available: boolean }) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-sea-100 px-3 py-2"
                >
                  <span className="text-sm text-ink">{room.room_label}</span>
                  <span className="text-xs text-ink-muted">
                    {room.price_monthly}€/mese ·{" "}
                    {room.is_available ? "libera" : "occupata"}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
