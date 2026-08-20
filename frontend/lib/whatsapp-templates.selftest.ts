/**
 * Smoke checks WhatsApp + CRM templates.
 * Run: npx --yes tsx lib/whatsapp-templates.selftest.ts
 */
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  interpolateTemplate,
} from "./whatsapp-templates";
import { createWhatsAppUrl, normalizeWhatsAppDigits } from "./whatsapp";
import { buildCrmEmail } from "./crm/email-templates";
import { outreachBlockReason } from "./crm/utils";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(normalizeWhatsAppDigits("3758222238") === "393758222238", "national IT");
assert(normalizeWhatsAppDigits("393758222238") === "393758222238", "no double 39");
assert(normalizeWhatsAppDigits("+44 7911 123456") === "447911123456", "UK");
assert(normalizeWhatsAppDigits("+33 6 12 34 56 78")?.startsWith("33"), "FR");
assert(normalizeWhatsAppDigits("") === null, "missing");

const ownerMsg = buildWhatsAppMessage("OWNER_FIRST_CONTACT", {
  contactType: "owner",
  firstName: "Anna",
  agentName: "Giovanni",
  coabitoLink: "https://coabito.it",
});
assert(ownerMsg.includes("Anna"), "owner firstName");
assert(!ownerMsg.includes("undefined"), "no undefined");
assert(ownerMsg.includes("gratuitamente"), "owner marketplace CTA");

const agency = buildWhatsAppMessage("AGENCY_FIRST_CONTACT", {
  contactType: "agency",
  firstName: "Luca",
  agencyName: "Adriatica Casa",
  coabitoLink: "https://coabito.it",
});
assert(agency.includes("Adriatica Casa"), "agency name");
assert(agency.includes("Buongiorno"), "agency tone");

const student = buildWhatsAppMessage("STUDENT_FIRST_CONTACT", {
  contactType: "student",
  firstName: "Luca",
  propertyLink: "https://coabito.it/stanza/abc",
  coabitoLink: "https://coabito.it",
});
assert(student.includes("coinquilini"), "student focus");
assert(student.includes("https://coabito.it/stanza/abc"), "property link");

const noName = interpolateTemplate("Ciao {{firstName}}!", { firstName: "" });
assert(noName === "Ciao!", "empty firstName greeting");

const url = createWhatsAppUrl("393758222238", "Ciao! 🏠");
assert(url?.includes("wa.me/393758222238"), "wa.me");
assert(url?.includes(encodeURIComponent("Ciao! 🏠")), "emoji encoding");
assert(buildWhatsAppUrl("393758222238", "x")?.startsWith("https://wa.me/"), "alias");

const email = buildCrmEmail("OWNER_FIRST_EMAIL", { firstName: "Anna" });
assert(email.subject.includes("Coabito"), "email subject");
assert(email.body.includes("Anna"), "email body");

const blocked = outreachBlockReason(
  {
    do_not_contact: true,
    email_opt_out: false,
    whatsapp_opt_out: false,
    status: "DO_NOT_CONTACT",
    last_contacted_at: null,
  },
  "email",
);
assert(blocked, "dnc blocks");

console.log("whatsapp+crm selftest OK");
