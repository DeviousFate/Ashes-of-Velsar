#!/usr/bin/env node

import { createRequire } from "node:module";
import { access, cp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const localAppData = process.env.LOCALAPPDATA;
if (!localAppData) throw new Error("LOCALAPPDATA is required to locate Foundry VTT.");
const foundryAppPath = process.env.FOUNDRY_APP_PATH
  ?? path.join(localAppData, "FoundryVTT", "resources", "app");
const require = createRequire(path.join(foundryAppPath, "package.json"));
const { ClassicLevel } = require("classic-level");

const expectedRoots = {
  journals: { expression: /^!journal![^!]+$/, count: 5 },
  scenes: { expression: /^!scenes![^!]+$/, count: 15 },
  campaign: { expression: /^!actors![^!]+$/, count: 20 },
  adventure: { expression: /^!adventures![^!]+$/, count: 1 }
};

const failures = [];
const packData = {};

async function readPack(name) {
  const snapshotPath = path.join(tmpdir(), "ashes-of-velsar-validation", name);
  await rm(snapshotPath, { recursive: true, force: true });
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await cp(path.join(ROOT, "packs", name), snapshotPath, { recursive: true });

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

function visit(value, callback, trail = "$") {
  callback(value, trail);
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, callback, `${trail}[${index}]`));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) visit(item, callback, `${trail}.${key}`);
  }
}

const manifest = JSON.parse(await readFile(path.join(ROOT, "module.json"), "utf8"));
if (manifest.id !== "ashes-of-velsar") failures.push("module.json has an unexpected id");
if (!manifest.relationships?.requires?.some(({ id }) => id === "sw5e-module")) {
  failures.push("module.json does not require sw5e-module");
}

for (const [name, expectation] of Object.entries(expectedRoots)) {
  const records = await readPack(name);
  packData[name] = records;
  const roots = records.filter(({ key }) => expectation.expression.test(key));
  if (roots.length !== expectation.count) {
    failures.push(`${name} has ${roots.length} root documents; expected ${expectation.count}`);
  }

  for (const { key, value } of records) {
    if (value?._id && value._id.length !== 16) failures.push(`${key} has invalid _id length ${value._id.length}`);
    visit(value, (item, trail) => {
      if (typeof item !== "string") return;
      if (item.includes("worlds/star-wars-echoes-of-the-republic")) failures.push(`${name}:${trail} retains a world asset path`);
      if (item.startsWith("tokenizer/")) failures.push(`${name}:${trail} retains a tokenizer asset path`);
      if (item.includes("@UUID[JournalEntry.")) failures.push(`${name}:${trail} retains a world Journal UUID`);
    });
  }
  console.log(`${name}: ${records.length} records, ${roots.length} root documents`);
}

function recordMap(records) {
  return new Map(records.map(({ key, value }) => [key, value]));
}

function collinearOverlap(first, second) {
  const [x1, y1, x2, y2] = first;
  const [cx1, cy1, cx2, cy2] = second;
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lengthSquared = vx * vx + vy * vy;
  if (!lengthSquared) return false;
  const cross1 = vx * (cy1 - y1) - vy * (cx1 - x1);
  const cross2 = vx * (cy2 - y1) - vy * (cx2 - x1);
  if (Math.abs(cross1) > 0.01 || Math.abs(cross2) > 0.01) return false;
  const projection = (x, y) => ((x - x1) * vx + (y - y1) * vy) / lengthSquared;
  const start = Math.max(0, Math.min(projection(cx1, cy1), projection(cx2, cy2)));
  const end = Math.min(1, Math.max(projection(cx1, cy1), projection(cx2, cy2)));
  return end - start > 0.0001;
}

const journalMap = recordMap(packData.journals);
for (const { key, value } of packData.journals.filter(({ key }) => /^!journal![^!]+$/.test(key))) {
  for (const pageId of value.pages ?? []) {
    if (!journalMap.has(`!journal.pages!${value._id}.${pageId}`)) failures.push(`${key} references missing page ${pageId}`);
  }
}

const sceneMap = recordMap(packData.scenes);
for (const { key, value } of packData.scenes.filter(({ key }) => /^!scenes![^!]+$/.test(key))) {
  if ((value.notes ?? []).length !== 1) failures.push(`${key} should contain exactly one journal pin`);
  for (const noteId of value.notes ?? []) {
    const note = sceneMap.get(`!scenes.notes!${value._id}.${noteId}`);
    if (!note) failures.push(`${key} references missing note ${noteId}`);
    if (note && !journalMap.has(`!journal.pages!${note.entryId}.${note.pageId}`)) {
      failures.push(`${key} note ${noteId} references a missing journal page`);
    }
  }

  if (!(value.walls?.length > 0)) failures.push(`${key} has no traced walls`);
  if (!(value.tokens?.length > 0)) failures.push(`${key} has no staged tokens`);
  for (const wallId of value.walls ?? []) {
    const wall = sceneMap.get(`!scenes.walls!${value._id}.${wallId}`);
    if (!wall) {
      failures.push(`${key} references missing wall ${wallId}`);
      continue;
    }
    if (!Array.isArray(wall.c) || wall.c.length !== 4 || wall.c.some((coordinate) => !Number.isFinite(coordinate))) {
      failures.push(`${key} wall ${wallId} has invalid coordinates`);
      continue;
    }
    const [x1, y1, x2, y2] = wall.c;
    if ([x1, x2].some((x) => x < 0 || x > value.width) || [y1, y2].some((y) => y < 0 || y > value.height)) {
      failures.push(`${key} wall ${wallId} falls outside the Scene bounds`);
    }
    if (x1 === x2 && y1 === y2) failures.push(`${key} wall ${wallId} has zero length`);
  }
  for (const tokenId of value.tokens ?? []) {
    const token = sceneMap.get(`!scenes.tokens!${value._id}.${tokenId}`);
    if (!token) {
      failures.push(`${key} references missing token ${tokenId}`);
      continue;
    }
    if (token.x < 0 || token.y < 0 || token.x >= value.width || token.y >= value.height) {
      failures.push(`${key} token ${tokenId} falls outside the Scene bounds`);
    }
    if (typeof token.delta !== "string" || !sceneMap.has(`!scenes.tokens.delta!${value._id}.${tokenId}.${token.delta}`)) {
      failures.push(`${key} token ${tokenId} references a missing ActorDelta`);
    }
  }
  const doors = (value.walls ?? [])
    .map((wallId) => sceneMap.get(`!scenes.walls!${value._id}.${wallId}`))
    .filter((wall) => wall?.door > 0).length;
  const sceneWalls = (value.walls ?? [])
    .map((wallId) => sceneMap.get(`!scenes.walls!${value._id}.${wallId}`))
    .filter(Boolean);
  const solidWalls = sceneWalls.filter((wall) => wall.flags?.["ashes-of-velsar"]?.kind === "solid");
  const replacements = sceneWalls.filter((wall) => ["door", "secretDoor", "window"].includes(wall.flags?.["ashes-of-velsar"]?.kind));
  for (const solid of solidWalls) {
    for (const replacement of replacements) {
      if (collinearOverlap(solid.c, replacement.c)) {
        failures.push(`${key} has an overlapping solid wall and ${replacement.flags["ashes-of-velsar"].kind}`);
      }
    }
  }
  console.log(`  ${value.name}: ${value.walls?.length ?? 0} walls, ${doors} doors, ${value.tokens?.length ?? 0} tokens`);
}

const actorMap = recordMap(packData.campaign);
const actorRootIds = new Set(packData.campaign
  .filter(({ key }) => /^!actors![^!]+$/.test(key))
  .map(({ value }) => value._id));
for (const { key, value } of packData.campaign.filter(({ key }) => /^!actors![^!]+$/.test(key))) {
  for (const itemId of value.items ?? []) {
    if (!actorMap.has(`!actors.items!${value._id}.${itemId}`)) failures.push(`${key} references missing item ${itemId}`);
  }
}
for (const { key, value } of packData.scenes.filter(({ key }) => /^!scenes.tokens![^!]+$/.test(key))) {
  if (!actorRootIds.has(value.actorId)) failures.push(`${key} references missing campaign actor ${value.actorId}`);
}

const adventure = packData.adventure.find(({ key }) => /^!adventures![^!]+$/.test(key))?.value;
if (adventure) {
  if (adventure.actors?.length !== 20) failures.push("Adventure does not embed all 20 campaign actors");
  if (adventure.journal?.length !== 5) failures.push("Adventure does not embed all 5 journals");
  if (adventure.scenes?.length !== 15) failures.push("Adventure does not embed all 15 scenes");
  if (!adventure.scenes?.every((scene) => scene.notes?.length === 1)) failures.push("Adventure scenes did not embed their journal pins");
  if (!adventure.scenes?.every((scene) => scene.walls?.length > 0)) failures.push("Adventure scenes did not embed traced walls");
  if (!adventure.scenes?.every((scene) => scene.tokens?.every((token) => token.delta && typeof token.delta === "object"))) {
    failures.push("Adventure scene tokens did not embed their ActorDelta documents");
  }
}

const requiredAssets = [
  ...Array.from({ length: 15 }, (_, index) => {
    const slugs = [
      "01-brackens-point-landing-yard.png", "02-bent-spanner-cantina.png", "03-compressor-station-scrapyard.png",
      "04-ressiks-rustclaw-hideout.png", "05-southern-cut-checkpoint.png", "06-daviks-reclamation-yard.png",
      "07-hidden-stargazer-hangar.png", "08-crashed-transport-site.png", "09-broken-beacon-site.png",
      "10-tovan-rells-hidden-refuge.png", "11-prisoner-transfer-ambush.png", "12-administration-square.png",
      "13-workers-blocks.png", "14-market-row-during-purge.png", "15-stargazer-hangar-finale-damaged.png"
    ];
    return `assets/maps/official/${slugs[index]}`;
  }),
  ...[
    "01_brackens_point_landing_yard_blueprint.png", "02_bent_spanner_cantina_blueprint.png",
    "03_compressor_station_and_scrapyard_blueprint.png", "04_ressiks_rustclaw_hideout_blueprint.png",
    "05_southern_cut_imperial_checkpoint_blueprint.png", "06_daviks_reclamation_yard_blueprint.png",
    "07_hidden_stargazer_hangar_blueprint.png", "08_crashed_transport_site_blueprint.png",
    "09_broken_beacon_site_blueprint.png", "10_tovan_rells_hidden_refuge_blueprint.png",
    "11_prisoner_transfer_ambush_blueprint.png", "12_administration_square_blueprint.png",
    "13_workers_blocks_blueprint.png", "14_market_row_during_the_purge_blueprint.png",
    "15_stargazer_hangar_finale_damaged_blueprint.png"
  ].map((file) => `assets/blueprints/${file}`),
  "assets/landing-page.png",
  "assets/maps/bt-9-stargazer-diagram.png",
  "assets/handouts/arrival-at-brackens-point.png",
  "assets/handouts/brackens-point-gm-map.png",
  "assets/actors/commander_voss.Avatar.webp",
  "assets/actors/commander_voss.Token.webp",
  "assets/actors/tovan_rell.Avatar.webp",
  "assets/actors/tovan_rell.Token.webp"
];
for (const relativePath of requiredAssets) {
  try {
    await access(path.join(ROOT, relativePath));
  } catch {
    failures.push(`Missing asset ${relativePath}`);
  }
}

if (failures.length) {
  console.error("Validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Ashes of Velsar module validation passed.");
