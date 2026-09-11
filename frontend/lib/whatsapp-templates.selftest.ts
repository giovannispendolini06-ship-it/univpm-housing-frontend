/**
 * Smoke checks for WhatsApp message building / URL creation.
 * Run: npx --yes tsx lib/whatsapp-templates.selftest.ts
 */
import { buildWhatsAppMessage, interpolateTemplate } from "./whatsapp-templates";
import { createWhatsAppUrl, normalizeWhatsAppDigits } from "./whatsapp";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(normalizeWhatsAppDigits("3758222238") === "393758222238", "national");
assert(normalizeWhatsAppDigits("393758222238") === "393758222238", "no double 39");
assert(normalizeWhatsAppDigits("+39 375 822 2238") === "393758222238", "spaces");

const ownerMsg = buildWhatsAppMessage("OWNER", {
  contactType: "owner",
  firstName: "Anna",
  agentName: "Giovanni",
  coabitoLink: "https://coabito.it",
});
assert(ownerMsg.includes("Anna"), "owner firstName");
assert(!ownerMsg.includes("undefined"), "no undefined");
assert(!ownerMsg.includes("«»"), "no empty property quotes");

const ownerWithProp = buildWhatsAppMessage("OWNER", {
  contactType: "owner",
  firstName: "Anna",
  propertyName: "Via Roma 1",
  coabitoLink: "https://coabito.it",
});
assert(ownerWithProp.includes("Via Roma 1"), "property name present");

const student = buildWhatsAppMessage("STUDENT", {
  contactType: "student",
  firstName: "Luca",
  propertyLink: "https://coabito.it/stanza/abc",
  coabitoLink: "https://coabito.it",
});
assert(student.includes("https://coabito.it/stanza/abc"), "property link");

const noName = interpolateTemplate("Ciao {{firstName}}!", { firstName: "" });
assert(noName === "Ciao!", "empty firstName greeting");

const url = createWhatsAppUrl("393758222238", "Ciao!");
assert(url?.startsWith("https://wa.me/393758222238?text="), "wa.me url");

console.log("whatsapp selftest OK");
