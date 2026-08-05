"use client";

import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export default function SignOutButton({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className={className ?? "text-xs text-ink-muted underline underline-offset-2"}
    >
      {label ?? "Esci"}
    </button>
  );
}
