import { professionalWork } from "./professionalWork";
import { projects } from "./projects";

it("keeps professional experience ordered from current to oldest", () => {
  expect(professionalWork.map(({ company }) => company)).toEqual([
    "Stakemate",
    "Ember / BINDY Street",
    "PocketApp",
  ]);
  expect(professionalWork[0].current).toBe(true);
  expect(professionalWork[2].location).toBe("Nigeria");
});

it("keeps all earlier portfolio projects in the archive", () => {
  expect(projects.map(({ name }) => name).sort()).toEqual([
    "Activo",
    "Fast Food Fast",
    "Kotigo",
    "Makaranta",
    "Pace Africa",
    "SECP",
  ]);
});
