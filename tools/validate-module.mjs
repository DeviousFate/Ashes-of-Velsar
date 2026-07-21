#!/usr/bin/env node

import { createRequire } from "node:module";
import { access, readFile } from "node:fs/promises";
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
  scenes: { expression: /^!scenes![^!]+$/, count: 14 },
  campaign: { expression: /^!actors![^!]+$/, count: 17 },
  adventure: { expression: /^!adventures![^!]+$/, count: 1 }
};

const failures = [];
const packData = {};

async function readPack(name) {
  const database = new ClassicLevel(path.join(ROOT, "packs", name), {
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
}

const actorMap = recordMap(packData.campaign);
for (const { key, value } of packData.campaign.filter(({ key }) => /^!actors![^!]+$/.test(key))) {
  for (const itemId of value.items ?? []) {
    if (!actorMap.has(`!actors.items!${value._id}.${itemId}`)) failures.push(`${key} references missing item ${itemId}`);
  }
}

const adventure = packData.adventure.find(({ key }) => /^!adventures![^!]+$/.test(key))?.value;
if (adventure) {
  if (adventure.actors?.length !== 17) failures.push("Adventure does not embed all 17 campaign actors");
  if (adventure.journal?.length !== 4) failures.push("Adventure does not embed all 4 journals");
  if (adventure.scenes?.length !== 14) failures.push("Adventure does not embed all 14 scenes");
  if (!adventure.scenes?.every((scene) => scene.notes?.length === 1)) failures.push("Adventure scenes did not embed their journal pins");
}

const requiredAssets = [
  "assets/maps/01-abandoned-compressor-station.png",
  "assets/maps/14-broken-beacon.png",
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
