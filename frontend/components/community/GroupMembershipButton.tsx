"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinGroupAction, leaveGroupAction } from "@/app/community/actions";

export default function GroupMembershipButton({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          if (isMember) await leaveGroupAction(groupId);
          else await joinGroupAction(groupId);
          router.refresh();
        });
      }}
      className={[
        "rounded-full px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60",
        isMember
          ? "border border-sea-200 bg-white text-ink-muted hover:border-sunset-500 hover:text-sunset-600"
          : "bg-sea-600 text-white hover:bg-sea-700",
      ].join(" ")}
    >
      {pending ? "…" : isMember ? "Esci dal gruppo" : "Unisciti"}
    </button>
  );
}
