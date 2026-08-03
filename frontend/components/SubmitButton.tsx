"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}

/**
 * Va messo DENTRO un <form action={serverAction}>. React lo aggiorna da
 * solo (via useFormStatus) appena il form viene inviato, senza bisogno di
 * gestire stato manualmente in ogni pagina.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Un attimo...",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
