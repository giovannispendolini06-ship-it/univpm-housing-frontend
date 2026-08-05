import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";
import { uploadPropertyImages, assignPropertyOwner, addRoom } from "../actions";
import DeleteImageButton from "../DeleteImageButton";
import DeletePropertyButton from "../DeletePropertyButton";
import EditRoomRow from "../EditRoomRow";
import RoomTenancyControl from "../RoomTenancyControl";
import SubmitButton from "@/components/SubmitButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

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

  // --- Margine: incasso dalle stanze occupate vs quanto versato al
  // proprietario. Calcolato qui, mostrato solo in questa pagina admin.
  const studentRevenue = (property.rooms ?? [])
    .filter((r: { is_available: boolean }) => !r.is_available)
    .reduce((sum: number, r: { price_monthly: number }) => sum + Number(r.price_monthly), 0);
  const propertyMargin = studentRevenue - Number(property.monthly_rent_to_owner);

  const { data: currentOwnerAccount } = await db
    .from("users")
    .select("email, role, full_name, phone")
    .eq("id", property.owner_id)
    .single();

  const isAssignedToRealOwner = currentOwnerAccount?.role === "owner";

  // Numero e nome del proprietario: dall'account collegato se c'è,
  // altrimenti dai contatti salvati sull'immobile.
  const ownerPhone = isAssignedToRealOwner
    ? currentOwnerAccount?.phone
    : property.owner_contact_phone;
  const ownerName = isAssignedToRealOwner
    ? currentOwnerAccount?.full_name
    : property.owner_contact_name;

  const whatsappLink = ownerPhone
    ? buildWhatsAppLink(
        ownerPhone,
        `Ciao${ownerName ? ` ${ownerName}` : ""}, sono Giovanni di Coabito — ti scrivo riguardo all'immobile in ${property.address}.`,
      )
    : null;

  const { data: images } = await db
    .from("property_images")
    .select("*")
    .eq("property_id", id)
    .order("created_at", { ascending: true });

  // --- Affitti attivi per le stanze di questo immobile ------------------
  const roomIds = (property.rooms ?? []).map((r: { id: string }) => r.id);
  const { data: tenancies } =
    roomIds.length > 0
      ? await db
          .from("room_tenancies")
          .select("id, room_id, started_at, users:student_id(full_name)")
          .in("room_id", roomIds)
          .is("ended_at", null)
      : { data: [] as never[] };

  const tenancyByRoom = new Map(
    (tenancies ?? []).map((t: any) => [
      t.room_id,
      { id: t.id, started_at: t.started_at, tenantName: t.users?.full_name ?? "Studente" },
    ]),
  );

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
            <Link
              href={`/admin/properties/${property.id}/edit`}
              className="mt-1 inline-block text-xs font-medium text-sea-700 underline underline-offset-2"
            >
              Modifica dati immobile
            </Link>
          </div>
          <DeletePropertyButton propertyId={property.id} />
        </div>

        {/* --- Proprietario --- */}
        <section className="mb-6 rounded-xl2 bg-surface p-5 shadow-card">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-ink">
              Proprietario
            </h2>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.41 5.82c0 4.55-3.7 8.25-8.25 8.25a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.55 3.7-8.25 8.25-8.25M8.5 6.75c-.16 0-.42.06-.65.31-.22.25-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.14 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.47-.28-.24-.13-1.44-.71-1.66-.79-.22-.08-.39-.13-.55.13-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.13-1.03-.38-1.96-1.2-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.13-.55-1.35-.77-1.84-.2-.48-.4-.42-.55-.42h-.15"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>

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

        {/* --- Margine (visibile solo a te, mai al proprietario) --------- */}
        <section className="rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-3 font-display text-base font-bold text-ink">
            Margine su questo immobile
          </h2>
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-ink-muted">Incasso da studenti</p>
              <p className="mt-0.5 font-display text-lg font-bold text-ink">
                {studentRevenue}€
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ink-muted">Pagato al proprietario</p>
              <p className="mt-0.5 font-display text-lg font-bold text-ink">
                {property.monthly_rent_to_owner}€
              </p>
            </div>
            <div>
              <p className="text-[11px] text-ink-muted">Margine</p>
              <p
                className={`mt-0.5 font-display text-lg font-bold ${propertyMargin >= 0 ? "text-sea-700" : "text-sunset-600"}`}
              >
                {propertyMargin}€
              </p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-ink-muted">
            Calcolato sulle sole stanze occupate. Questo riepilogo non è mai visibile al
            proprietario nel suo account.
          </p>
        </section>

        {/* --- Stanze --- */}
        <section className="rounded-xl2 bg-surface p-5 shadow-card">
          <h2 className="mb-3 font-display text-base font-bold text-ink">
            Stanze
          </h2>
          <div className="space-y-2">
            {(property.rooms ?? []).map(
              (room: {
                id: string;
                room_label: string;
                price_monthly: number;
                estimated_utilities: number;
                size_sqm: number | null;
                has_private_bathroom: boolean;
                has_balcony: boolean;
                max_occupants: number;
                services_included: string[];
                is_available: boolean;
                available_from: string | null;
              }) => (
                <div key={room.id} className="space-y-1.5">
                  <EditRoomRow room={room} propertyId={property.id} />
                  <RoomTenancyControl
                    roomId={room.id}
                    propertyId={property.id}
                    tenancy={tenancyByRoom.get(room.id) ?? null}
                  />
                </div>
              ),
            )}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-sea-700">
              + Aggiungi un&apos;altra stanza
            </summary>
            <form action={addRoom} className="mt-3 space-y-2 rounded-xl border border-sea-100 bg-bg p-3">
              <input type="hidden" name="property_id" value={property.id} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  name="room_label"
                  required
                  placeholder="Nome stanza"
                  className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                />
                <input
                  type="number"
                  name="price_monthly"
                  required
                  placeholder="Prezzo €"
                  className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                />
                <input
                  type="number"
                  name="estimated_utilities"
                  placeholder="Spese €"
                  className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                />
                <input
                  type="number"
                  name="max_occupants"
                  placeholder="Max occupanti"
                  className="rounded-lg border border-sea-100 px-2 py-1.5 text-xs focus:border-sea-400 focus:outline-none"
                />
              </div>
              <SubmitButton className="rounded-full bg-sea-600 px-3.5 py-1.5 text-xs font-semibold text-white transition enabled:hover:bg-sea-700 disabled:opacity-50">
                Aggiungi stanza
              </SubmitButton>
            </form>
          </details>
        </section>
      </div>
    </main>
  );
}
