/**
 * Sanity checks for guaranteed-rent estimate (no Jest required).
 * Run: npx tsx scripts/check-guaranteed-rent-estimate.ts
 */
import { estimateGuaranteedRent } from "../lib/owner/guaranteed-rent-estimate";

let failed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("ok:", msg);
  }
}

// Reference default: Torrette 11€/mq × 85 mq × 1.0 × 0.91 → round to 10
const def = estimateGuaranteedRent({
  zone: "torrette",
  rooms: 3,
  sizeSqm: 85,
  condition: "buono",
});
assert(def.guaranteed === 850, `default guaranteed (got ${def.guaranteed})`);
assert(def.low === 790, `default low (got ${def.low})`);
assert(def.high === 910, `default high (got ${def.high})`);

// Centro 13 × 85 × 1.0 × 0.91
const centro = estimateGuaranteedRent({
  zone: "centro",
  rooms: 3,
  sizeSqm: 85,
  condition: "buono",
});
assert(centro.guaranteed === 1010, `centro (got ${centro.guaranteed})`);

// Ristrutturato multiplier 1.1
const reno = estimateGuaranteedRent({
  zone: "torrette",
  rooms: 3,
  sizeSqm: 85,
  condition: "ristrutturato",
});
assert(reno.guaranteed === 940, `ristrutturato (got ${reno.guaranteed})`);

// Da rinfrescare 0.9
const refresh = estimateGuaranteedRent({
  zone: "palombina",
  rooms: 2,
  sizeSqm: 100,
  condition: "rinfrescare",
});
// 10 * 100 * 0.9 * 0.91 = 819 → 820
assert(refresh.guaranteed === 820, `palombina refresh (got ${refresh.guaranteed})`);

if (failed > 0) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nAll estimate checks passed.");
