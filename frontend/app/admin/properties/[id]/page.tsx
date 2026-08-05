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
    .select("email, role, full_name")
    .eq("id", property.owner_id)
    .single();

  const isAssignedToRealOwner = currentOwnerAccount?.role === "owner";

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
