import type { MatchLocale } from "@/lib/matching";

export type FitReason = {
  label: string;
  detail: string;
  weight: "alto" | "medio" | "basso";
};

const WEIGHT_RANK: Record<FitReason["weight"], number> = {
  alto: 0,
  medio: 1,
  basso: 2,
};

/**
 * Human “su misura” sentence from the top match factors.
 * Uses reasons already produced by calculateMatchScore (locale-aware labels).
 */
export function buildMatchFitSentence(input: {
  reasons: FitReason[];
  guaranteedRent: boolean;
  locale?: MatchLocale;
}): string | null {
  const locale = input.locale === "en" ? "en" : "it";
  const top = [...input.reasons]
    .sort((a, b) => WEIGHT_RANK[a.weight] - WEIGHT_RANK[b.weight])
    .slice(0, 3);

  if (top.length === 0 && !input.guaranteedRent) return null;

  const snippets = top.map((r) => softenDetail(r.detail, locale));
  if (input.guaranteedRent) {
    snippets.push(
      locale === "en"
        ? "Coabito guarantees the rent to the owner"
        : "il canone è garantito da Coabito al proprietario",
    );
  }

  const unique = Array.from(new Set(snippets.filter(Boolean))).slice(0, 3);
  if (unique.length === 0) return null;

  if (locale === "en") {
    if (unique.length === 1) {
      return `This room is a great fit: ${unique[0]}.`;
    }
    if (unique.length === 2) {
      return `This room fits you like a glove: ${unique[0]}, and ${unique[1]}.`;
    }
    return `Tailored for you: ${unique[0]}, ${unique[1]}, and ${unique[2]}.`;
  }

  if (unique.length === 1) {
    return `Questa stanza ti sta bene: ${unique[0]}.`;
  }
  if (unique.length === 2) {
    return `Questa stanza ti sta a pennello: ${unique[0]}, e ${unique[1]}.`;
  }
  return `Su misura per te: ${unique[0]}, ${unique[1]}, e ${unique[2]}.`;
}

function softenDetail(detail: string, locale: MatchLocale): string {
  const d = detail.trim().replace(/\.$/, "");
  if (!d) return d;
  // Prefer lowercase continuation after the colon in IT sentences
  if (locale === "it" && /^[A-ZÀÈÉÌÒÙ]/.test(d)) {
    return d.charAt(0).toLowerCase() + d.slice(1);
  }
  return d;
}
