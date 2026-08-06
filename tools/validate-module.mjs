#!/usr/bin/env node

import { createRequire } from "node:module";
import { access, cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
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
  journals: { expression: /^!journal![^!]+$/, count: 4 },
  scenes: { expression: /^!scenes![^!]+$/, count: 18 },
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
      if (item.includes("assets/blueprints/") || item.includes("brackens-point-gm-map.png") || item.includes("GM Map Journal")) {
        failures.push(`${name}:${trail} retains removed map-reference content`);
      }
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
if (journalMap.has("!journal!AoVBlueprints001")) failures.push("Obsolete GM Map Journal is still packaged");
if (packData.journals.some(({ key }) => key.includes("AoVBlueprint") || key.includes("AoVGmMapPage"))) {
  failures.push("Journals pack contains obsolete blueprint or GM-map records");
}
const handoutJournalId = "5PyjVzBeImPu8J7N";
const handoutJournal = journalMap.get(`!journal!${handoutJournalId}`);
if (handoutJournal?.pages?.length !== 20) failures.push("Player Handouts journal does not contain all 20 replacement documents");
for (const pageId of handoutJournal?.pages ?? []) {
  const page = journalMap.get(`!journal.pages!${handoutJournalId}.${pageId}`);
  if (page?.type !== "image") failures.push(`Player handout ${pageId} is not an image page`);
  if (!page?.src?.startsWith("modules/ashes-of-velsar/assets/handouts/")) failures.push(`Player handout ${pageId} has an invalid asset path`);
  if (!page?.flags?.["ashes-of-velsar"]?.playerHandout) failures.push(`Player handout ${pageId} lacks the replacement-handout flag`);
}
for (const { key, value } of packData.journals.filter(({ key }) => /^!journal\.pages!/.test(key))) {
  const content = value.text?.content ?? "";
  const expression = /Compendium\.ashes-of-velsar\.journals\.JournalEntry\.5PyjVzBeImPu8J7N\.JournalEntryPage\.([A-Za-z0-9]+)/g;
  for (const match of content.matchAll(expression)) {
    if (!journalMap.has(`!journal.pages!${handoutJournalId}.${match[1]}`)) failures.push(`${key} links to missing replacement handout ${match[1]}`);
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

  if ((value.walls?.length ?? 0) !== 0) failures.push(`${key} should have no generated walls`);
  const sceneAssetPrefix = "modules/ashes-of-velsar/assets/maps/dungeondraft/";
  if (!value.background?.src?.startsWith(sceneAssetPrefix)) {
    failures.push(`${key} does not reference a packaged replacement map`);
  } else {
    const sceneAssetPath = path.join(ROOT, "assets", "maps", "dungeondraft", value.background.src.slice(sceneAssetPrefix.length));
    const image = await readFile(sceneAssetPath);
    const imageWidth = image.readUInt32BE(16);
    const imageHeight = image.readUInt32BE(20);
    if (value.width !== imageWidth || value.height !== imageHeight) {
      failures.push(`${key} dimensions ${value.width}x${value.height} do not match its ${imageWidth}x${imageHeight} map`);
    }
    const expectedGridSize = imageWidth / 44;
    if (value.grid?.size !== expectedGridSize) failures.push(`${key} does not use its map's ${expectedGridSize}-pixel grid size`);
  }
  if (!(value.tokens?.length > 0) && value._id !== "AoVTownRndm00001") failures.push(`${key} has no staged tokens`);
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
  console.log(`  ${value.name}: ${value.walls?.length ?? 0} walls, ${value.tokens?.length ?? 0} tokens`);
}
if (packData.scenes.some(({ key }) => /^!scenes\.walls!/.test(key))) failures.push("Scenes pack contains embedded wall documents");

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
  if (adventure.journal?.length !== 4) failures.push("Adventure does not embed all 4 journals");
  if (adventure.scenes?.length !== 18) failures.push("Adventure does not embed all 18 scenes");
  const embeddedHandouts = adventure.journal?.find((journal) => journal._id === "5PyjVzBeImPu8J7N");
  if (embeddedHandouts?.pages?.length !== 20) failures.push("Adventure does not embed all 20 replacement handouts");
  if (!adventure.scenes?.every((scene) => scene.notes?.length === 1)) failures.push("Adventure scenes did not embed their journal pins");
  if (!adventure.scenes?.every((scene) => (scene.walls?.length ?? 0) === 0)) failures.push("Adventure contains generated Scene walls");
  if (!adventure.scenes?.every((scene) => scene.tokens?.every((token) => token.delta && typeof token.delta === "object"))) {
    failures.push("Adventure scene tokens did not embed their ActorDelta documents");
  }
}

const handoutSlugs = [
  "01-imperial-arrival-processing-notice.png",
  "02-brackens-point-temporary-visitor-permit.png",
  "03-missing-person-pavo-nesh.png",
  "04-tensin-blacks-job-chit.png",
  "05-compressor-station-route-sketch.png",
  "06-rustclaw-claim-marker.png",
  "07-imperial-navicomputer-evidence-sheet.png",
  "08-davik-renn-reclamation-invoice.png",
  "09-bt-9-stargazer-registration-card.png",
  "10-wayfarer-cargo-passenger-manifest.png",
  "11-wayfarer-distress-log.png",
  "12-broken-beacon-coordinate-record.png",
  "13-tovan-rells-medical-ledger.png",
  "14-tovans-archive-fragment.png",
  "15-desert-shrine-inscription-rubbing.png",
  "16-contingency-cinderglass-directive.png",
  "17-imperial-wanted-bulletin-tovan-rell.png",
  "18-prisoner-transfer-manifest.png",
  "19-imperial-curfew-withdrawal-order.png",
  "20-brackens-point-emergency-broadcast.png"
];

const requiredAssets = [
  ...Array.from({ length: 18 }, (_, index) => {
    const slugs = [
      "01-brackens-point-landing-yard.png", "02-bent-spanner-cantina.png", "03-compressor-station-scrapyard.png",
      "04-ressiks-rustclaw-hideout.png", "05-southern-cut-checkpoint.png", "06-daviks-reclamation-yard.png",
      "07-hidden-stargazer-hangar.png", "08-crashed-transport-site.png", "09-broken-beacon-site.png",
      "10-tovan-rells-hidden-refuge.png", "11-prisoner-transfer-ambush.png", "12-administration-square.png",
      "13-workers-blocks.png", "14-market-row-during-purge.png", "15-stargazer-hangar-finale-damaged.png",
      "16-doctor-veys-clinic.png", "17-desert-shrine.png", "18-brackens-point-town-encounter.png"
    ];
    return `assets/maps/dungeondraft/${slugs[index]}`;
  }),
  ...handoutSlugs.map((slug) => `assets/handouts/${slug}`),
  "assets/landing-page.png",
  "assets/maps/bt-9-stargazer-diagram.png",
  "assets/actors/commander_voss.Avatar.webp",
  "assets/actors/commander_voss.Token.webp",
  "assets/actors/tovan_rell.Avatar.webp",
  "assets/actors/tovan_rell.Token.webp"
];
for (const relativePath of requiredAssets) {
  try {
    await access(path.join(ROOT, relativePath));
    if (relativePath.startsWith("assets/maps/dungeondraft/")) {
      const image = await readFile(path.join(ROOT, relativePath));
      const width = image.readUInt32BE(16);
      const height = image.readUInt32BE(20);
      const expectedWidth = relativePath.endsWith("03-compressor-station-scrapyard.png") ? 1408 : 2816;
      const expectedHeight = relativePath.endsWith("03-compressor-station-scrapyard.png") ? 768 : 1536;
      if (width !== expectedWidth || height !== expectedHeight) {
        failures.push(`${relativePath} is ${width}x${height}; expected ${expectedWidth}x${expectedHeight}`);
      }
    }
  } catch {
    failures.push(`Missing asset ${relativePath}`);
  }
}

const packagedHandouts = (await readdir(path.join(ROOT, "assets", "handouts"))).sort();
if (JSON.stringify(packagedHandouts) !== JSON.stringify([...handoutSlugs].sort())) {
  failures.push("assets/handouts does not contain exactly the 20 replacement handout images");
}

for (const obsoletePath of [
  "assets/blueprints",
  "assets/handouts/abandoned-compressor-station.png",
  "assets/handouts/arrival-at-brackens-point.png",
  "assets/handouts/brackens-point-gm-map.png",
  "assets/handouts/brackens-point-player-map.png",
  "assets/handouts/burning-of-brackens-point.png",
  "assets/handouts/checkpoint-aurek.png",
  "assets/handouts/davik-renns-hidden-hangar.png",
  "assets/handouts/the-bent-spanner.png",
  "assets/handouts/the-forgotten-shrine.png",
  "assets/handouts/the-hermits-refuge.png",
  "assets/handouts/the-rustclaw-revel.png",
  "assets/handouts/wreck-in-the-eastern-basin.png"
]) {
  try {
    await access(path.join(ROOT, obsoletePath));
    failures.push(`Obsolete asset remains at ${obsoletePath}`);
  } catch {
    // Expected: superseded assets have been removed.
  }
}

if (failures.length) {
  console.error("Validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Ashes of Velsar module validation passed.");
