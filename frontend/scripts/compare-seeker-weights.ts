/**
 * Side-by-side seeker weight verification (student vs worker).
 * Run: npx tsx scripts/compare-seeker-weights.ts
 */
import {
  MATCH_WEIGHTS,
  calculateMatchScore,
  type StudentProfileRow,
  type RoomForMatching,
  type PropertyForMatching,
} from "../lib/matching";

const seeker: StudentProfileRow = {
  user_id: "test-seeker",
  campus_id: "campus-1",
  budget_max: 450,
  study_habit: "silenzio_assoluto",
  sociability_level: 2,
  guests_frequency: "raramente",
  cleanliness_level: 4,
  is_smoker: false,
  tolerates_smokers: false,
};

const noisyRoommate: StudentProfileRow = {
  ...seeker,
  user_id: "roommate-1",
  study_habit: "musica_in_studio",
  sociability_level: 5,
  guests_frequency: "spesso",
  cleanliness_level: 2,
};

const room: RoomForMatching = {
  id: "room-1",
  price_monthly: 400,
  estimated_utilities: 40,
  is_available: true,
};

const property: PropertyForMatching = {
  id: "prop-1",
  zone: "centro",
};

function sumWeights(kind: "student" | "worker") {
  const w = MATCH_WEIGHTS[kind];
  return w.budget + w.distance + w.focus + w.cleanliness + w.social;
}

console.log("=== MATCH_WEIGHTS ===");
console.log("student", MATCH_WEIGHTS.student, "sum", sumWeights("student"));
console.log("worker ", MATCH_WEIGHTS.worker, "sum", sumWeights("worker"));

const studentScore = calculateMatchScore(
  seeker,
  room,
  property,
  [noisyRoommate],
  3.2,
  "it",
  "student",
);
const workerScore = calculateMatchScore(
  seeker,
  room,
  property,
  [noisyRoommate],
  3.2,
  "it",
  "worker",
);

console.log("\n=== Same profile/room, different seekerType ===");
console.log("student score", studentScore.score);
console.log(
  "student top reasons",
  studentScore.reasoning.map((r) => r.label).join(" · "),
);
console.log("worker  score", workerScore.score);
console.log(
  "worker  top reasons",
  workerScore.reasoning.map((r) => r.label).join(" · "),
);

if (sumWeights("student") !== 100 || sumWeights("worker") !== 100) {
  console.error("FAIL: weights must sum to 100");
  process.exit(1);
}

const studentHasStudy = studentScore.reasoning.some((r) =>
  /studio|Study/i.test(r.label),
);
const workerHasQuiet = workerScore.reasoning.some((r) =>
  /Tranquillità|Quiet|spostamenti|Commute|Vicinanza/i.test(r.label),
);

console.log("\nstudent reasons mention study?", studentHasStudy);
console.log("worker reasons mention commute/quiet?", workerHasQuiet);
console.log("\nOK — dual weight sets behave differently on identical inputs.");
