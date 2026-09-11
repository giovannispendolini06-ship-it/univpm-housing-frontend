import {
  calculateRoommateMatchScore,
  toStudentProfileRow,
} from "../lib/matching-roommates";

const a = toStudentProfileRow({
  user_id: "a",
  campus_id: "c1",
  budget_max: 400,
  study_habit: "silenzio_assoluto",
  sociability_level: 3,
  guests_frequency: "raramente",
  cleanliness_level: 4,
  is_smoker: false,
  tolerates_smokers: false,
});
const b = toStudentProfileRow({
  user_id: "b",
  campus_id: "c1",
  budget_max: 420,
  study_habit: "silenzio_assoluto",
  sociability_level: 3,
  guests_frequency: "raramente",
  cleanliness_level: 4,
  is_smoker: false,
  tolerates_smokers: false,
});
const c = toStudentProfileRow({
  user_id: "c",
  campus_id: "c2",
  budget_max: 900,
  study_habit: "musica_in_studio",
  sociability_level: 5,
  guests_frequency: "spesso",
  cleanliness_level: 1,
  is_smoker: true,
  tolerates_smokers: true,
});
if (!a || !b || !c) throw new Error("parse fail");
const high = calculateRoommateMatchScore(a, b, "it");
const low = calculateRoommateMatchScore(a, c, "it");
console.log(JSON.stringify({ high: high.score, low: low.score }));
if (high.score <= low.score) throw new Error("expected high > low");
if (high.score < 70) throw new Error("expected high compatibility");
console.log("ok");
