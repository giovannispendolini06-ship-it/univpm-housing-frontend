import { SITE_URL } from "@/lib/site";
import { translations } from "@/lib/i18n/translations";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Coabito",
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512.png`,
    email: "info@coabito.it",
    description:
      "Piattaforma per studenti fuori sede: trova casa chattando con Vesta, vicino al tuo ateneo.",
    areaServed: {
      "@type": "City",
      name: "Ancona",
    },
    sameAs: [] as string[],
  };
}

/** FAQPage da copy italiano homepage (studenti + proprietari). */
export function faqPageJsonLd() {
  const faq = translations.it.faq;
  const items = [...faq.studentItems, ...faq.ownerItems];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** FAQ dedicata studenti (/faq). */
export function studentFaqPageJsonLd() {
  const items = translations.it.faqStudenti.items;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: `${SITE_URL}/faq`,
  };
}

export function guideArticleJsonLd() {
  const g = translations.it.guidaAffittoAncona;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.subtitle,
    author: {
      "@type": "Organization",
      name: "Coabito",
    },
    publisher: {
      "@type": "Organization",
      name: "Coabito",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512.png`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/guida/affittare-casa-studenti-ancona`,
    inLanguage: "it-IT",
  };
}

export function guidePrimaVoltaJsonLd() {
  const g = translations.it.guidaPrimaVolta;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.intro,
    author: {
      "@type": "Person",
      name: "Giovanni",
    },
    publisher: {
      "@type": "Organization",
      name: "Coabito",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icons/icon-512.png`,
      },
    },
    mainEntityOfPage: `${SITE_URL}/guida/prima-volta-fuori-sede`,
    inLanguage: "it-IT",
  };
}
