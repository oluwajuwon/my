const equipmentMap = {
  barbell: "barbell", dumbbell: "dumbbell", kettlebell: "kettlebell", cable: "cable",
  flat_bench: "bench", resistance_band: "band", loop_band: "band", pull_up_bar: "pull-up-bar",
  smith_machine: "smith-machine", ez_bar: "ez-bar", trap_bar: "trap-bar", plates: "plates",
  dip_station: "dip-station", rings: "rings", ab_wheel: "ab-wheel", stability_ball: "stability-ball",
  plyo_box: "plyo-box", suspension_trainer: "suspension-trainer", battle_rope: "battle-rope",
  jump_rope: "jump-rope", sled: "sled", slam_ball: "medicine-ball", climbing_rope: "climbing-rope",
};

const cardioEquipment = new Set(["air_bike", "elliptical", "rower", "ski_erg", "stair_climber", "stationary_bike", "treadmill"]);

const muscleGroupMap = {
  pectoralis_major: "chest", latissimus_dorsi: "back", rhomboids: "back", trapezius: "back",
  erector_spinae: "back", anterior_deltoid: "shoulders", lateral_deltoid: "shoulders",
  posterior_deltoid: "shoulders", supraspinatus: "shoulders", biceps_brachii: "biceps",
  brachialis: "biceps", brachioradialis: "biceps", triceps_brachii: "triceps",
  quadriceps: "quads", hamstrings: "hamstrings", gluteus_maximus: "glutes", gluteus_medius: "glutes",
  abductors: "glutes", adductors: "quads", gastrocnemius: "calves", soleus: "calves",
  rectus_abdominis: "core", transverse_abdominis: "core", obliques: "core", quadratus_lumborum: "core",
  hip_flexors: "core", forearm_extensors: "forearms", forearm_flexors: "forearms", forearms: "forearms",
  serratus_anterior: "chest",
};

// Existing Vela IDs are retained for user history and deep links.
const legacyByRepDbId = {
  "bench-press":"barbell-bench", "db-bench-press":"db-bench", "incline-db-press":"incline-db",
  "chest-press-machine":"machine-chest", "cable-fly":"cable-fly", "push-up":"push-up",
  "assisted-dips":"assisted-dip", "pull-up":"pull-up", "lat-pulldown":"lat-pulldown",
  "barbell-row":"barbell-row", "single-arm-db-row":"one-arm-row", "seated-cable-row":"seated-row",
  "chest-supported-db-row":"chest-row", "face-pull":"face-pull", "deadlift":"deadlift",
  "ohp":"ohp", "dumbbell-shoulder-press":"db-shoulder", "lateral-raise":"lateral-raise",
  "cable-lateral-raise":"cable-lateral", "dumbbell-reverse-fly":"reverse-fly", "arnold-press":"arnold-press",
  "barbell-curl":"barbell-curl", "bicep-curl":"db-curl", "hammer-curl":"hammer-curl", "cable-curl":"cable-curl",
  "tricep-pushdown":"triceps-pushdown", "ez-bar-lying-tricep-extension":"skull-crusher",
  "overhead-tricep-extension":"overhead-extension", "close-grip-push-up":"close-grip-pushup",
  "squat":"back-squat", "front-squat":"front-squat", "goblet-squat":"goblet-squat",
  "leg-press":"leg-press", "leg-extension":"leg-extension", "bulgarian-split-squat":"split-squat",
  "walking-lunge":"walking-lunge", "step-ups":"step-up", "romanian-deadlift":"rdl",
  "dumbbell-romanian-deadlift":"db-rdl", "seated-leg-curl":"leg-curl", "leg-curl":"lying-curl",
  "nordic-hamstring-curl":"nordic-curl", "hip-thrust":"hip-thrust", "glute-bridge":"glute-bridge",
  "cable-kickback":"cable-kickback", "db-sumo-squat":"sumo-squat", "standing-calf-raise":"standing-calf",
  "seated-calf-raise":"seated-calf", "single-leg-calf-raise":"single-calf", "plank":"plank",
  "dead-bug":"dead-bug", "cable-crunch":"cable-crunch", "cable-pallof-press":"pallof",
  "hanging-knee-raise":"hanging-knee", "dumbbell-farmers-walk":"farmer-carry", "kettlebell-swing":"kb-swing",
  "thruster":"thruster", "rowing-machine":"rowing", "incline-treadmill-walk":"incline-walk",
  "stationary-bike":"bike", "jump-rope":"jump-rope", "cat-cow":"cat-cow",
  "kneeling-hip-flexor-stretch":"hip-flexor", "thoracic-bridge":"thoracic-rotation",
};

module.exports = { equipmentMap, cardioEquipment, muscleGroupMap, legacyByRepDbId };
