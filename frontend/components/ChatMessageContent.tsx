import type { ReactNode } from "react";

const QUESTION_TAG_RE = /<QUESTION>([\s\S]*?)<\/QUESTION>/gi;
/** Frase che termina con ? (IT/EN), senza spezzare URL. */
const QUESTION_SENTENCE_RE = /([^.!?\n]*(?:\?|¿\?))/g;

/**
 * Evidenzia le domande di Vesta: grassetto + colore teal.
 * Preferisce i tag <QUESTION>…</QUESTION> (prompt); in fallback
 * evidenzia le frasi che finiscono con "?".
 */
export function renderVestaMessageContent(content: string): ReactNode {
  if (!content) return null;

  const hasTags = /<QUESTION>/i.test(content);
  if (hasTags) {
    return renderWithQuestionTags(content);
  }
  return renderWithQuestionHeuristic(content);
}

function renderWithQuestionTags(content: string): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  const re = new RegExp(QUESTION_TAG_RE.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(content)) !== null) {
    if (match.index > last) {
      nodes.push(content.slice(last, match.index));
    }
    nodes.push(
      <strong key={`q-${key++}`} className="font-bold text-sea-700">
        {match[1].trim()}
      </strong>,
    );
    last = match.index + match[0].length;
  }
  if (last < content.length) {
    nodes.push(content.slice(last));
  }
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

function renderWithQuestionHeuristic(content: string): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  const re = new RegExp(QUESTION_SENTENCE_RE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(content)) !== null) {
    const raw = match[1];
    // Evita match troppo corti / rumore ("?")
    const trimmed = raw.trim();
    if (trimmed.length < 3) continue;

    if (match.index > last) {
      nodes.push(content.slice(last, match.index));
    }
    // Conserva spazi iniziali fuori dal strong
    const leadingWs = raw.match(/^\s*/)?.[0] ?? "";
    const body = raw.slice(leadingWs.length);
    if (leadingWs) nodes.push(leadingWs);
    nodes.push(
      <strong key={`qh-${key++}`} className="font-bold text-sea-700">
        {body}
      </strong>,
    );
    last = match.index + raw.length;
  }

  if (last < content.length) {
    nodes.push(content.slice(last));
  }

  if (nodes.length === 0) return content;
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}
