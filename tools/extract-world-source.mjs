#!/usr/bin/env node

import { createRequire } from "node:module";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const localAppData = process.env.LOCALAPPDATA;
if (!localAppData) throw new Error("LOCALAPPDATA is required to locate Foundry VTT.");

const worldPath = process.env.AOV_WORLD_PATH
  ?? path.join(localAppData, "FoundryVTT", "Data", "worlds", "star-wars-echoes-of-the-republic");
const foundryAppPath = process.env.FOUNDRY_APP_PATH
  ?? path.join(localAppData, "FoundryVTT", "resources", "app");
const outputPath = path.resolve("source", "world");

const require = createRequire(path.join(foundryAppPath, "package.json"));
const { ClassicLevel } = require("classic-level");

const actorIds = new Set([
  "0ml1uw24lJevFdH1",
  "1bzV6DO0kf6CsfkR",
  "20iCLIcHVHWZqvBg",
  "9QrTMNJRTA2W7S0X",
  "g9reSEqGK1ID9YYT",
  "h4dL6k5jK0a1jsQK",
  "I8CQenDTnm6l7rnT",
  "IVG8XsGcbY3JtVHz",
  "l3JFZ0aZahnlv5OX",
  "oaOJSg6s2xEWWKnD",
  "qq0tzc3QOueOfpFk",
  "RXoLdtGV00z6dxTt",
  "SFeQoXE5sQZxcHwZ",
  "WiUcetQQtQd8bHPI",
  "xaclhcdT5TyhAMlV",
  "ym5vG10BPlnJvqxq",
  "zdPrGvzoFH9rq1Ie"
]);

const journalIds = new Set([
  "0031X75piojXUkIM",
  "5PyjVzBeImPu8J7N",
  "RQiN0Cs1B9S1UZZE"
]);

const sceneIds = new Set([
  "xk0d9gBiaJHvZewJ",
  "MkBY37RL9t0H1cqF",
  "6vbTdZx3xrxOVgP6",
  "Cdc4vsuci2jeqQJN",
  "EL02sxuRACXvwSXT",
  "MrN6tvX9p3j4aXs4",
  "Qen9gVMLOpISn9Pk",
  "jLuD2jD9RKIcsMaJ",
  "nZOXeCzRCNObMGNa"
]);

async function readStore(name) {
  const snapshotPath = path.join(tmpdir(), "ashes-of-velsar-source", name);
  await rm(snapshotPath, { recursive: true, force: true });
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await cp(path.join(worldPath, "data", name), snapshotPath, { recursive: true });

  const database = new ClassicLevel(snapshotPath, {
    keyEncoding: "utf8",
    valueEncoding: "json"
  });
  const records = [];
  try {
    await database.open();
    for await (const [key, value] of database.iterator()) records.push({ key, value });
  } finally {
    await database.close();
  }
  return records;
}

function includesDocument(key, ids) {
  return [...ids].some((id) => key.includes(id));
}

await mkdir(outputPath, { recursive: true });

const actors = await readStore("actors");
const journals = await readStore("journal");
const scenes = await readStore("scenes");

const snapshots = {
  actors: actors.filter(({ key }) => includesDocument(key, actorIds)),
  journals: journals.filter(({ key }) => includesDocument(key, journalIds)),
  scenes: scenes.filter(({ key }) => includesDocument(key, sceneIds))
};

for (const [name, records] of Object.entries(snapshots)) {
  const target = path.join(outputPath, `${name}.json`);
  await writeFile(target, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  console.log(`Wrote ${records.length} ${name} records to ${target}`);
}

await writeFile(path.join(outputPath, "source.json"), `${JSON.stringify({
  worldPath,
  extractedAt: new Date().toISOString(),
  counts: Object.fromEntries(Object.entries(snapshots).map(([name, records]) => [name, records.length]))
}, null, 2)}\n`, "utf8");
