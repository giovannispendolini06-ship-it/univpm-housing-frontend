import { redirect } from "next/navigation";

/** Alias pubblico: /registrati → login in modalità registrazione. */
export default function RegistratiPage() {
  redirect("/login?mode=signup");
}
