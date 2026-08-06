#!/usr/bin/env node

import { createRequire } from "node:module";
import { copyFile, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { officialEncounterActorIds, sceneLayouts } from "../source/scene-layouts.mjs";

const MODULE_ID = "ashes-of-velsar";
const MODULE_PATH = `modules/${MODULE_ID}`;
const CORE_VERSION = "13.351";
const SYSTEM_VERSION = "5.2.5";
const ROOT = process.cwd();
const localAppData = process.env.LOCALAPPDATA;
if (!localAppData) throw new Error("LOCALAPPDATA is required to locate Foundry VTT.");

const foundryDataPath = process.env.FOUNDRY_DATA_PATH
  ?? path.join(localAppData, "FoundryVTT", "Data");
const foundryAppPath = process.env.FOUNDRY_APP_PATH
  ?? path.join(localAppData, "FoundryVTT", "resources", "app");
const worldPath = process.env.AOV_WORLD_PATH
  ?? path.join(foundryDataPath, "worlds", "star-wars-echoes-of-the-republic");
const worldImagePath = path.join(worldPath, "Outside Images");
const sw5eModulePath = path.join(foundryDataPath, "modules", "sw5e-module");

const require = createRequire(path.join(foundryAppPath, "package.json"));
const { ClassicLevel } = require("classic-level");

const actorFolderIds = {
  campaign: "AoVCampaignNpc01",
  imperial: "AoVImperialNpc01",
  vehicles: "AoVVehicles00001"
};
const journalFolderId = "AoVJournals00001";
const sceneFolderIds = {
  chapter1: "AoVScenesCh10001",
  chapter2: "AoVScenesCh20001",
  chapter3: "AoVScenesCh30001",
  chapter4: "AoVScenesCh40001",
  side: "AoVScenesSide001"
};

const dashboardId = "AoVDashboard0001";
const dashboardPages = {
  start: "AoVStartHere0001",
  scenes: "AoVSceneIndex001",
  npcs: "AoVNpcDirectory1",
  landing: "AoVLandingPage01"
};
const adventureId = "AoVAdventure0001";
const adventureJournalId = "RQiN0Cs1B9S1UZZE";
const quickReferenceId = "0031X75piojXUkIM";
const handoutsId = "5PyjVzBeImPu8J7N";

const chapterPages = {
  chapter1: "vD2jM2BNpIIqr8Wg",
  chapter2: "q6HWcF0HXeZIYbQm",
  chapter3: "btRQ1OLEMeBDGO4V",
  chapter4: "FhjNIxVzJXf2tddR",
  overview: "sfDsrbbFy44go2KT"
};

const mapDefinitions = [
  { id: "AoVLandingMap001", name: "01 — Bracken’s Point Landing Yard", slug: "01-brackens-point-landing-yard.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter1", page: "chapter1" },
  { id: "MkBY37RL9t0H1cqF", name: "02 — The Bent Spanner Cantina", slug: "02-bent-spanner-cantina.png", width: 2816, height: 1536, sourceWidth: 1411, sourceHeight: 1114, folder: "chapter1", page: "chapter1" },
  { id: "xk0d9gBiaJHvZewJ", name: "03 — Compressor Station and Scrapyard", slug: "03-compressor-station-scrapyard.png", width: 1408, height: 768, gridSize: 32, sourceWidth: 1409, sourceHeight: 1116, folder: "chapter1", page: "chapter1" },
  { id: "6vbTdZx3xrxOVgP6", name: "04 — Ressik’s Rustclaw Hideout", slug: "04-ressiks-rustclaw-hideout.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter2", page: "chapter2" },
  { id: "EL02sxuRACXvwSXT", name: "05 — Southern Cut Imperial Checkpoint", slug: "05-southern-cut-checkpoint.png", width: 2816, height: 1536, sourceWidth: 1619, sourceHeight: 971, folder: "chapter4", page: "chapter4" },
  { id: "AoVReclaimMap001", name: "06 — Davik’s Reclamation Yard", slug: "06-daviks-reclamation-yard.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter2", page: "chapter2" },
  { id: "nZOXeCzRCNObMGNa", name: "07 — Hidden Stargazer Hangar", slug: "07-hidden-stargazer-hangar.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter4", page: "chapter4" },
  { id: "MrN6tvX9p3j4aXs4", name: "08 — Crashed Transport Site (The Wayfarer)", slug: "08-crashed-transport-site.png", width: 2816, height: 1536, sourceWidth: 1396, sourceHeight: 1127, folder: "chapter3", page: "chapter3" },
  { id: "AoVSceneMap00014", name: "09 — Broken Beacon Site", slug: "09-broken-beacon-site.png", width: 2816, height: 1536, sourceWidth: 1322, sourceHeight: 1190, folder: "chapter3", page: "chapter3" },
  { id: "Qen9gVMLOpISn9Pk", name: "10 — Tovan Rell’s Hidden Refuge", slug: "10-tovan-rells-hidden-refuge.png", width: 2816, height: 1536, sourceWidth: 1409, sourceHeight: 1116, folder: "chapter3", page: "chapter3" },
  { id: "jLuD2jD9RKIcsMaJ", name: "11 — Prisoner Transfer Ambush", slug: "11-prisoner-transfer-ambush.png", width: 2816, height: 1536, sourceWidth: 1580, sourceHeight: 995, folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00010", name: "12 — Administration Square", slug: "12-administration-square.png", width: 2816, height: 1536, sourceWidth: 1433, sourceHeight: 1098, folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00011", name: "13 — Workers’ Blocks", slug: "13-workers-blocks.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00012", name: "14 — Market Row During the Purge", slug: "14-market-row-during-purge.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter4", page: "chapter4" },
  { id: "AoVFinaleMap0001", name: "15 — Stargazer Hangar Finale (Damaged)", slug: "15-stargazer-hangar-finale-damaged.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "chapter4", page: "chapter4" },
  { id: "Cdc4vsuci2jeqQJN", name: "16 — Doctor Vey’s Clinic", slug: "16-doctor-veys-clinic.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "side", page: "chapter2" },
  { id: "AoVSceneMap00013", name: "17 — Desert Shrine", slug: "17-desert-shrine.png", width: 2816, height: 1536, sourceWidth: 1448, sourceHeight: 1086, folder: "side", page: "chapter3" },
  { id: "AoVTownRndm00001", name: "18 — Bracken’s Point Town Encounter", slug: "18-brackens-point-town-encounter.png", width: 2816, height: 1536, sourceWidth: 2816, sourceHeight: 1536, folder: "side", page: "chapter1", optional: true }
];

const sourceMapFiles = [
  "01 Bracken's Point Landing.png",
  "02 Bent Spanner.png",
  "03 Compressor Station.png",
  "4 Ressik's Rustclaw Hideout.png",
  "05 South Cut Checkpoint.png",
  "06 Davik's Reclamation Yard.png",
  "07 Hidden Stargazer Hangar.png",
  "08 Crashed Transport.png",
  "09 Broken Beacon Site.png",
  "10 Toven Rell's Hidden Refuge.png",
  "11 Prisoner Transport Ambush.png",
  "12 Administration Square.png",
  "13 Worker's Blocks.png",
  "14 Market Row (Purge).png",
  "15 Stargazer Hangar Damaged.png",
  "16 Doctor Vey's Clinic.png",
  "17 Desert Shrine.png",
  "18 Streets of Bracken's Point.png"
];
if (sourceMapFiles.length !== mapDefinitions.length) throw new Error("Every Scene map requires an accurately named AOV Maps source file.");

const handoutFiles = [
  ["Arrival at Bracken’s Point.png", "arrival-at-brackens-point.png"],
  ["Bracken's Point Player Map.png", "brackens-point-player-map.png"],
  ["Checkpoint Aurek.png", "checkpoint-aurek.png"],
  ["Davik Renn’s Hidden Hangar.png", "davik-renns-hidden-hangar.png"],
  ["The Abandoned Compressor Station.png", "abandoned-compressor-station.png"],
  ["The Bent Spanner.png", "the-bent-spanner.png"],
  ["The Burning of Bracken's Point.png", "burning-of-brackens-point.png"],
  ["The Forgotten Shrine.png", "the-forgotten-shrine.png"],
  ["The Hermit’s Refuge.png", "the-hermits-refuge.png"],
  ["The Rustclaw Revel.png", "the-rustclaw-revel.png"],
  ["The Wreck in the Eastern Basin.png", "wreck-in-the-eastern-basin.png"]
];

const actorIds = new Set([
  "0ml1uw24lJevFdH1", "1bzV6DO0kf6CsfkR", "20iCLIcHVHWZqvBg", "9QrTMNJRTA2W7S0X",
  "g9reSEqGK1ID9YYT", "h4dL6k5jK0a1jsQK", "I8CQenDTnm6l7rnT", "IVG8XsGcbY3JtVHz",
  "l3JFZ0aZahnlv5OX", "oaOJSg6s2xEWWKnD", "qq0tzc3QOueOfpFk", "RXoLdtGV00z6dxTt",
  "SFeQoXE5sQZxcHwZ", "WiUcetQQtQd8bHPI", "xaclhcdT5TyhAMlV", "ym5vG10BPlnJvqxq",
  "zdPrGvzoFH9rq1Ie"
]);
const imperialActorIds = new Set(["IVG8XsGcbY3JtVHz", "l3JFZ0aZahnlv5OX", "g9reSEqGK1ID9YYT", "ym5vG10BPlnJvqxq"]);
const packagedActorIds = new Set([...actorIds, ...officialEncounterActorIds]);

const now = Date.now();
const deepClone = (value) => structuredClone(value);
const compendiumUuid = (pack, type, id) => `Compendium.${MODULE_ID}.${pack}.${type}.${id}`;

function stats(source = null) {
  return {
    compendiumSource: source,
    duplicateSource: null,
    exportSource: null,
    coreVersion: CORE_VERSION,
    systemId: "dnd5e",
    systemVersion: SYSTEM_VERSION,
    createdTime: now,
    modifiedTime: now,
    lastModifiedBy: null
  };
}

function folderDocument(id, name, type, sort, color) {
  return {
    _id: id,
    name,
    type,
    sorting: "m",
    sort,
    color,
    folder: null,
    description: "",
    flags: { [MODULE_ID]: { generated: true } },
    _stats: stats()
  };
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function copyAsset(source, relativeTarget) {
  const target = path.join(ROOT, relativeTarget);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function readPackSnapshot(packPath, snapshotName) {
  const snapshotPath = path.join(tmpdir(), "ashes-of-velsar-build", snapshotName);
  await rm(snapshotPath, { recursive: true, force: true });
  await mkdir(snapshotPath, { recursive: true });
  for (const entry of await readdir(packPath, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === "LOCK") continue;
    await copyFile(path.join(packPath, entry.name), path.join(snapshotPath, entry.name));
  }

  const database = new ClassicLevel(snapshotPath, { keyEncoding: "utf8", valueEncoding: "json" });
  const records = [];
  try {
    await database.open();
    for await (const [key, value] of database.iterator()) records.push({ key, value });
  } finally {
    await database.close();
    await rm(snapshotPath, { recursive: true, force: true });
  }
  return records;
}

async function writePack(name, records) {
  const packPath = path.resolve(ROOT, "packs", name);
  const packsRoot = path.resolve(ROOT, "packs") + path.sep;
  if (!packPath.startsWith(packsRoot)) throw new Error(`Refusing to replace unsafe pack path: ${packPath}`);
  await rm(packPath, { recursive: true, force: true });
  await mkdir(path.dirname(packPath), { recursive: true });

  const database = new ClassicLevel(packPath, { keyEncoding: "utf8", valueEncoding: "json" });
  try {
    await database.open();
    await database.batch(records.map(({ key, value }) => ({ type: "put", key, value })));
  } finally {
    await database.close();
  }
  console.log(`Built packs/${name} with ${records.length} records`);
}

function replaceWorldJournalLinks(html) {
  if (!html) return html;
  return html.replaceAll(
    `@UUID[JournalEntry.${handoutsId}.JournalEntryPage.`,
    `@UUID[${compendiumUuid("journals", "JournalEntry", handoutsId)}.JournalEntryPage.`
  );
}

function rewriteHandoutSource(src) {
  if (!src) return src;
  const decoded = decodeURIComponent(src);
  const sourceName = path.basename(decoded);
  const normalize = (name) => name.normalize("NFKC").replace(/[’']/g, "").toLocaleLowerCase("en-US");
  const match = handoutFiles.find(([name]) => normalize(name) === normalize(sourceName));
  return match ? `${MODULE_PATH}/assets/handouts/${match[1]}` : src;
}

function makeJournalPage(id, name, content, sort) {
  return {
    _id: id,
    name,
    type: "text",
    sort,
    title: { show: true, level: 1 },
    image: {},
    text: { format: 1, content, markdown: "" },
    video: { controls: true, volume: 0.5 },
    src: null,
    system: {},
    ownership: { default: -1 },
    flags: { [MODULE_ID]: { generated: true } },
    _stats: stats()
  };
}

function makeImagePage(id, name, src, sort, flags = {}) {
  return {
    _id: id,
    name,
    type: "image",
    sort,
    title: { show: true, level: 1 },
    image: { alignment: "center", caption: "" },
    text: { format: 1, content: "", markdown: "" },
    video: { controls: true, volume: 0.5 },
    src,
    system: {},
    ownership: { default: -1 },
    flags: { [MODULE_ID]: { generated: true, ...flags } },
    _stats: stats()
  };
}

function makeJournalRoot(id, name, pages, sort, ownership = { default: 0 }) {
  return {
    _id: id,
    name,
    pages,
    folder: journalFolderId,
    categories: [],
    sort,
    ownership,
    flags: { [MODULE_ID]: { campaignJournal: true } },
    _stats: stats()
  };
}

function makeSceneNote(scene, index) {
  const id = `AoVNote${String(index + 1).padStart(9, "0")}`;
  return {
    id,
    value: {
      _id: id,
      entryId: adventureJournalId,
      pageId: chapterPages[scene.page],
      x: 72,
      y: 72,
      iconSize: 48,
      fontFamily: "Arial",
      fontSize: 32,
      textAnchor: 1,
      textColor: "#ffffff",
      texture: {
        src: "icons/svg/book.svg",
        tint: "#d2aa55",
        scaleX: 1,
        scaleY: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        anchorX: 0.5,
        anchorY: 0.5,
        fit: "contain",
        alphaThreshold: 0
      },
      text: "",
      global: true,
      elevation: 0,
      sort: 0,
      flags: { [MODULE_ID]: { chapter: scene.page } }
    }
  };
}

function embeddedId(prefix, sceneIndex, recordIndex) {
  const suffixLength = 16 - prefix.length - 2;
  return `${prefix}${String(sceneIndex + 1).padStart(2, "0")}${String(recordIndex + 1).padStart(suffixLength, "0")}`;
}

function chainSegments(chains = []) {
  const segments = [];
  for (const chain of chains) {
    if (chain.length < 4 || chain.length % 2) throw new Error(`Invalid wall chain: ${chain.join(",")}`);
    for (let index = 0; index <= chain.length - 4; index += 2) {
      const segment = chain.slice(index, index + 4);
      if (segment[0] === segment[2] && segment[1] === segment[3]) continue;
      segments.push(segment);
    }
  }
  return segments;
}

function subtractCollinearSegment(segment, cutter) {
  const [x1, y1, x2, y2] = segment;
  const [cx1, cy1, cx2, cy2] = cutter;
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lengthSquared = vx * vx + vy * vy;
  const cross1 = vx * (cy1 - y1) - vy * (cx1 - x1);
  const cross2 = vx * (cy2 - y1) - vy * (cx2 - x1);
  if (lengthSquared === 0 || Math.abs(cross1) > 0.01 || Math.abs(cross2) > 0.01) return [segment];

  const projection = (x, y) => ((x - x1) * vx + (y - y1) * vy) / lengthSquared;
  const start = Math.max(0, Math.min(projection(cx1, cy1), projection(cx2, cy2)));
  const end = Math.min(1, Math.max(projection(cx1, cy1), projection(cx2, cy2)));
  if (end - start <= 0.0001) return [segment];
  const pointAt = (position) => [
    Math.round((x1 + vx * position) * 1000) / 1000,
    Math.round((y1 + vy * position) * 1000) / 1000
  ];
  const output = [];
  if (start > 0.0001) output.push([x1, y1, ...pointAt(start)]);
  if (end < 0.9999) output.push([...pointAt(end), x2, y2]);
  return output;
}

function subtractReplacementWalls(segments, replacements) {
  let output = segments;
  for (const replacement of replacements) {
    output = output.flatMap((segment) => subtractCollinearSegment(segment, replacement));
  }
  return output;
}

function makeWall(id, coordinates, kind) {
  const restrictions = {
    solid: { light: 20, sight: 20, sound: 20, move: 20 },
    door: { light: 20, sight: 20, sound: 20, move: 20 },
    secretDoor: { light: 20, sight: 20, sound: 20, move: 20 },
    window: { light: 0, sight: 0, sound: 10, move: 20 },
    terrain: { light: 10, sight: 10, sound: 10, move: 20 },
    barrier: { light: 0, sight: 0, sound: 10, move: 20 }
  }[kind];
  if (!restrictions) throw new Error(`Unknown wall kind ${kind}`);
  return {
    _id: id,
    c: coordinates,
    ...restrictions,
    dir: 0,
    door: kind === "door" ? 1 : kind === "secretDoor" ? 2 : 0,
    ds: 0,
    threshold: { light: null, sight: null, sound: null, attenuation: false },
    animation: kind === "door" || kind === "secretDoor"
      ? { type: "", texture: null, flip: false, double: false, direction: 1, duration: 750, strength: 1 }
      : null,
    doorSound: "",
    flags: { [MODULE_ID]: { generated: true, kind } }
  };
}

function localizeTokenTexture(src) {
  if (!src) return src;
  const original = src.split("?")[0];
  if (!original.startsWith("tokenizer/")) return original;
  return `${MODULE_PATH}/assets/actors/${path.basename(original)}`;
}

function makeSceneToken(actor, placement, sceneIndex, tokenIndex) {
  if (!actor) throw new Error(`Missing actor ${placement.actorId} required by scene layout ${sceneIndex + 1}`);
  const tokenId = embeddedId("AoVTok", sceneIndex, tokenIndex);
  const deltaId = embeddedId("AoVDel", sceneIndex, tokenIndex);
  const value = {
    ...deepClone(actor.prototypeToken),
    _id: tokenId,
    name: placement.name ?? actor.name,
    actorId: actor._id,
    actorLink: false,
    delta: deltaId,
    x: placement.x,
    y: placement.y,
    elevation: placement.elevation ?? 0,
    hidden: placement.hidden ?? false,
    disposition: placement.disposition ?? actor.prototypeToken?.disposition ?? -1,
    sort: tokenIndex,
    shape: 4,
    locked: false,
    _movementHistory: [],
    _regions: [],
    flags: {
      ...(actor.prototypeToken?.flags ?? {}),
      [MODULE_ID]: { generated: true, staged: true }
    }
  };
  value.texture = { ...(value.texture ?? {}), src: localizeTokenTexture(value.texture?.src) };
  delete value.randomImg;
  delete value.appendNumber;
  delete value.prependAdjective;

  const delta = {
    _id: deltaId,
    system: {},
    items: [],
    effects: [],
    flags: { [MODULE_ID]: { generated: true } },
    name: null,
    type: null,
    img: null,
    ownership: null
  };
  return { tokenId, deltaId, value, delta };
}

function dashboardHtml() {
  return `<h1>Ashes of Velsar</h1>
<p><strong>Adventure:</strong> four to six characters, levels 1–4<br><strong>Foundry:</strong> v13 / D&amp;D5e 5.2.5 / SW5E module 1.3.9</p>
<blockquote><p>Import the <strong>Ashes of Velsar — Complete Adventure</strong> compendium once. The import preserves stable IDs so scene journal pins and campaign links remain connected.</p></blockquote>
<h2>Run the Campaign</h2>
<ul>
<li>@UUID[${compendiumUuid("journals", "JournalEntry", adventureJournalId)}]{Full Adventure Journal}</li>
<li>@UUID[${compendiumUuid("journals", "JournalEntry", quickReferenceId)}]{Quick Reference}</li>
<li>@UUID[${compendiumUuid("journals", "JournalEntry", handoutsId)}]{Player Handouts}</li>
</ul>
<h2>Rules Sources</h2>
<p>Use the installed SW5E compendiums for rules, equipment, powers, and conditions. The campaign pack contains the Velsar-specific cast plus the three standard SW5E adversaries required by the staged encounters.</p>
<ul>
<li><a href="https://sw5e.com/rules">Official SW5E Rules</a></li>
<li><a href="https://github.com/sw5e-foundry/sw5e-module">SW5E Foundry Module</a></li>
</ul>`;
}

function sceneIndexHtml() {
  const items = mapDefinitions
    .map((scene) => `<li>@UUID[${compendiumUuid("scenes", "Scene", scene.id)}]{${scene.name}}${scene.optional ? " — optional random encounter" : ""}</li>`)
    .join("\n");
  return `<h1>Scene Index</h1><p>The numbered scenes follow their recommended campaign order. Scene 18 is an optional town map for random encounters. Every imported Scene includes a campaign journal pin.</p><ol>${items}</ol>`;
}

function npcDirectoryHtml(actorRoots) {
  const items = actorRoots
    .sort((a, b) => a.value.name.localeCompare(b.value.name))
    .map(({ value }) => `<li>@UUID[${compendiumUuid("campaign", "Actor", value._id)}]{${value.name}}</li>`)
    .join("\n");
  return `<h1>Campaign Actors</h1><p>Velsar-specific NPCs, the BT-9 Stargazer, and the Trooper, Scout Trooper, and Viper Probe Droid used by the staged encounters are stored here.</p><ul>${items}</ul>`;
}

function embedActor(root, recordMap) {
  const actor = deepClone(root);
  actor.items = (root.items ?? []).map((itemId) => {
    const item = deepClone(recordMap.get(`!actors.items!${root._id}.${itemId}`));
    if (!item) return null;
    item.effects = (item.effects ?? []).map((effectId) =>
      deepClone(recordMap.get(`!actors.items.effects!${root._id}.${itemId}.${effectId}`))
    ).filter(Boolean);
    return item;
  }).filter(Boolean);
  actor.effects = (root.effects ?? []).map((effectId) =>
    deepClone(recordMap.get(`!actors.effects!${root._id}.${effectId}`))
  ).filter(Boolean);
  return actor;
}

function embedJournal(root, recordMap) {
  const journal = deepClone(root);
  journal.pages = (root.pages ?? []).map((pageId) =>
    deepClone(recordMap.get(`!journal.pages!${root._id}.${pageId}`))
  ).filter(Boolean);
  return journal;
}

function embedScene(root, recordMap) {
  const scene = deepClone(root);
  for (const collection of ["notes", "tokens", "walls", "lights", "sounds", "templates", "tiles", "drawings", "regions"]) {
    scene[collection] = (root[collection] ?? []).map((id) => {
      const document = deepClone(recordMap.get(`!scenes.${collection}!${root._id}.${id}`));
      if (collection === "tokens" && document && typeof document.delta === "string") {
        document.delta = deepClone(recordMap.get(`!scenes.tokens.delta!${root._id}.${id}.${document.delta}`));
      }
      return document;
    }).filter(Boolean);
  }
  return scene;
}

const [sourceActors, sourceJournals, sourceScenes, sw5eMonsterRecords] = await Promise.all([
  readJson("source/world/actors.json"),
  readJson("source/world/journals.json"),
  readJson("source/world/scenes.json"),
  readPackSnapshot(path.join(sw5eModulePath, "packs", "monsters"), "sw5e-monsters")
]);
const officialEncounterRecords = sw5eMonsterRecords
  .filter(({ key }) => [...officialEncounterActorIds].some((actorId) => key.includes(actorId)))
  .map(({ key, value }) => ({ key, value: deepClone(value) }));
const tokenActorRoots = new Map([...sourceActors, ...officialEncounterRecords]
  .filter(({ key }) => /^!actors![^!]+$/.test(key))
  .map(({ value }) => [value._id, value]));

await copyAsset(path.join(worldImagePath, "Maps", "Diagram.png"), path.join("assets", "maps", "bt-9-stargazer-diagram.png"));
for (const [sourceName, targetName] of handoutFiles) {
  if (targetName === "brackens-point-player-map.png") continue;
  await copyAsset(path.join(worldImagePath, "Handouts", "Ashes of Velsar", sourceName), path.join("assets", "handouts", targetName));
}

const journalRecords = sourceJournals.map(({ key, value }) => ({ key, value: deepClone(value) }));
for (const record of journalRecords) {
  const value = record.value;
  if (record.key.startsWith("!journal!")) {
    value.folder = journalFolderId;
    value.flags = { ...value.flags, [MODULE_ID]: { campaignJournal: true } };
    value._stats = stats(value._stats?.compendiumSource ?? null);
    if (value._id === adventureJournalId) value.name = "Ashes of Velsar — Adventure";
    if (value._id === quickReferenceId) value.name = "Ashes of Velsar — Quick Reference";
    if (value._id === handoutsId) value.name = "Ashes of Velsar — Handouts";
  } else if (record.key.startsWith("!journal.pages!")) {
    value._stats = stats(value._stats?.compendiumSource ?? null);
    if (value.text?.content) value.text.content = replaceWorldJournalLinks(value.text.content);
    if (value.type === "image") value.src = rewriteHandoutSource(value.src);
    if (value._id === chapterPages.overview) value.name = "Campaign Guide";
    if (value._id === "KJkq6Iwst83DHe1j") value.name = "Quick Reference";
  }
}

const actorRootPreview = sourceActors
  .concat(officialEncounterRecords)
  .filter(({ key }) => /^!actors![^!]+$/.test(key))
  .map(({ key, value }) => ({ key, value: deepClone(value) }));
const dashboardPageRecords = [
  { id: dashboardPages.start, value: makeJournalPage(dashboardPages.start, "Start Here", dashboardHtml(), 0) },
  { id: dashboardPages.scenes, value: makeJournalPage(dashboardPages.scenes, "Scene Index", sceneIndexHtml(), 100000) },
  { id: dashboardPages.npcs, value: makeJournalPage(dashboardPages.npcs, "Campaign Actors", npcDirectoryHtml(actorRootPreview), 200000) },
  { id: dashboardPages.landing, value: makeImagePage(dashboardPages.landing, "Campaign Landing Page", `${MODULE_PATH}/assets/landing-page.png`, 300000) }
];
journalRecords.push({ key: `!journal!${dashboardId}`, value: makeJournalRoot(dashboardId, "00 — Ashes of Velsar GM Dashboard", dashboardPageRecords.map(({ id }) => id), -100000) });
for (const page of dashboardPageRecords) journalRecords.push({ key: `!journal.pages!${dashboardId}.${page.id}`, value: page.value });
journalRecords.push({ key: `!folders!${journalFolderId}`, value: folderDocument(journalFolderId, "Ashes of Velsar", "JournalEntry", 0, "#9e2b25") });

const sceneSourceRoots = new Map(sourceScenes
  .filter(({ key }) => /^!scenes![^!]+$/.test(key))
  .map(({ value }) => [value._id, value]));
const sceneTemplate = sceneSourceRoots.get("xk0d9gBiaJHvZewJ") ?? sceneSourceRoots.values().next().value;
if (!sceneTemplate) throw new Error("The source snapshot does not contain a Scene template.");

const sceneRecords = [];
for (const [index, definition] of mapDefinitions.entries()) {
  const scene = deepClone(sceneSourceRoots.get(definition.id) ?? sceneTemplate);
  const backgroundPath = `${MODULE_PATH}/assets/maps/dungeondraft/${definition.slug}`;
  const note = makeSceneNote(definition, index);
  const layout = sceneLayouts[definition.slug];
  if (!layout) throw new Error(`Missing staged token layout for ${definition.slug}`);
  const embeddedRecords = [];
  const wallIds = [];

  const tokenIds = [];
  for (const [tokenIndex, placement] of (layout.tokens ?? []).entries()) {
    const scaledPlacement = {
      ...placement,
      x: Math.round(placement.x * definition.width / definition.sourceWidth),
      y: Math.round(placement.y * definition.height / definition.sourceHeight)
    };
    const staged = makeSceneToken(tokenActorRoots.get(placement.actorId), scaledPlacement, index, tokenIndex);
    tokenIds.push(staged.tokenId);
    embeddedRecords.push({ key: `!scenes.tokens!${definition.id}.${staged.tokenId}`, value: staged.value });
    embeddedRecords.push({
      key: `!scenes.tokens.delta!${definition.id}.${staged.tokenId}.${staged.deltaId}`,
      value: staged.delta
    });
  }
  scene._id = definition.id;
  scene.name = definition.name;
  scene.folder = sceneFolderIds[definition.folder];
  scene.active = false;
  scene.navigation = false;
  scene.navName = "";
  scene.navOrder = index * 10;
  scene.width = definition.width;
  scene.height = definition.height;
  scene.padding = 0;
  scene.background = {
    ...(scene.background ?? {}),
    src: backgroundPath,
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    anchorX: 0,
    anchorY: 0,
    fit: "fill",
    tint: "#ffffff",
    alphaThreshold: 0
  };
  scene.thumb = backgroundPath;
  scene.grid = { ...(scene.grid ?? {}), type: 0, size: definition.gridSize ?? 64, distance: 5, units: "ft" };
  scene.tokens = tokenIds;
  scene.walls = wallIds;
  scene.lights = [];
  scene.sounds = [];
  scene.templates = [];
  scene.tiles = [];
  scene.drawings = [];
  scene.regions = [];
  scene.notes = [note.id];
  scene.flags = {
    ...scene.flags,
    [MODULE_ID]: {
      chapter: definition.page,
      sourceMap: `AOV Maps/${sourceMapFiles[index]}`,
      tracedWalls: 0,
      manualWallsExpected: true,
      optionalEncounter: Boolean(definition.optional),
      stagedTokens: tokenIds.length
    }
  };
  scene._stats = stats(scene._stats?.compendiumSource ?? null);
  sceneRecords.push({ key: `!scenes!${definition.id}`, value: scene });
  sceneRecords.push({ key: `!scenes.notes!${definition.id}.${note.id}`, value: note.value });
  sceneRecords.push(...embeddedRecords);
}
for (const [key, name, sort, color] of [
  ["chapter1", "Chapter 1 — A Simple Job", 0, "#9e2b25"],
  ["chapter2", "Chapter 2 — The Rustclaw Revel", 100000, "#9e5a25"],
  ["chapter3", "Chapter 3 — The Ghost in the Hills", 200000, "#6b6475"],
  ["chapter4", "Chapter 4 — Fire from the Sky", 300000, "#611b18"],
  ["side", "Optional Encounters", 400000, "#88764d"]
]) {
  sceneRecords.push({ key: `!folders!${sceneFolderIds[key]}`, value: folderDocument(sceneFolderIds[key], name, "Scene", sort, color) });
}

const actorRecords = [...sourceActors, ...officialEncounterRecords]
  .map(({ key, value }) => ({ key, value: deepClone(value) }));
for (const record of actorRecords) {
  const rootMatch = /^!actors!([^!]+)$/.exec(record.key);
  if (!rootMatch) {
    if (record.value?._stats) record.value._stats = stats(record.value._stats.compendiumSource ?? null);
    continue;
  }
  const actor = record.value;
  if (!packagedActorIds.has(actor._id)) continue;
  actor.folder = actor._id === "0ml1uw24lJevFdH1"
    ? actorFolderIds.vehicles
    : imperialActorIds.has(actor._id) || officialEncounterActorIds.has(actor._id)
      ? actorFolderIds.imperial
      : actorFolderIds.campaign;
  actor.flags = {
    ...actor.flags,
    [MODULE_ID]: {
      campaignActor: true,
      officialSw5eActor: officialEncounterActorIds.has(actor._id)
    }
  };
  actor._stats = stats(actor._stats?.compendiumSource ?? null);

  if (actor._id === "0ml1uw24lJevFdH1") {
    actor.img = `${MODULE_PATH}/assets/maps/bt-9-stargazer-diagram.png`;
    if (actor.prototypeToken?.texture) actor.prototypeToken.texture.src = actor.img;
    continue;
  }

  if (officialEncounterActorIds.has(actor._id)) continue;

  for (const target of [
    { holder: actor, field: "img" },
    { holder: actor.prototypeToken?.texture, field: "src" }
  ]) {
    if (!target.holder?.[target.field]) continue;
    const original = target.holder[target.field].split("?")[0];
    const baseName = path.basename(original);
    const destination = path.join("assets", "actors", baseName);
    await copyAsset(path.join(foundryDataPath, ...original.split("/")), destination);
    target.holder[target.field] = `${MODULE_PATH}/${destination.replaceAll("\\", "/")}`;
  }
}

actorRecords.push(
  { key: `!folders!${actorFolderIds.campaign}`, value: folderDocument(actorFolderIds.campaign, "Velsar NPCs", "Actor", 0, "#88764d") },
  { key: `!folders!${actorFolderIds.imperial}`, value: folderDocument(actorFolderIds.imperial, "Imperial Antagonists", "Actor", 100000, "#9e2b25") },
  { key: `!folders!${actorFolderIds.vehicles}`, value: folderDocument(actorFolderIds.vehicles, "Vehicles", "Actor", 200000, "#5d6875") }
);

await writePack("journals", journalRecords);
await writePack("scenes", sceneRecords);
await writePack("campaign", actorRecords);

const actorMap = new Map(actorRecords.filter(({ key }) => !key.startsWith("!folders!")).map(({ key, value }) => [key, value]));
const journalMap = new Map(journalRecords.filter(({ key }) => !key.startsWith("!folders!")).map(({ key, value }) => [key, value]));
const sceneMap = new Map(sceneRecords.filter(({ key }) => !key.startsWith("!folders!")).map(({ key, value }) => [key, value]));
const actorRoots = actorRecords.filter(({ key }) => /^!actors![^!]+$/.test(key)).map(({ value }) => embedActor(value, actorMap));
const journalRoots = journalRecords.filter(({ key }) => /^!journal![^!]+$/.test(key)).map(({ value }) => embedJournal(value, journalMap));
const sceneRoots = sceneRecords.filter(({ key }) => /^!scenes![^!]+$/.test(key)).map(({ value }) => embedScene(value, sceneMap));
const allFolders = [...journalRecords, ...sceneRecords, ...actorRecords]
  .filter(({ key }) => key.startsWith("!folders!"))
  .map(({ value }) => deepClone(value));

const adventure = {
  _id: adventureId,
  name: "Ashes of Velsar",
  img: `${MODULE_PATH}/assets/landing-page.png`,
  caption: "Ashes of Velsar",
  sort: 0,
  description: "<p><strong>A complete SW5E adventure for four to six characters of 1st–4th level.</strong></p><p>Import this Adventure to create the campaign journals, player handouts, eighteen illustrated Scenes, campaign actors, folders, and linked Scene journal pins. Scene 18 is an optional Bracken’s Point town map for random encounters. Scene walls are intentionally empty for the GM to configure manually.</p>",
  actors: actorRoots,
  combats: [],
  items: [],
  journal: journalRoots,
  scenes: sceneRoots,
  tables: [],
  macros: [],
  cards: [],
  playlists: [],
  folders: allFolders,
  folder: null,
  ownership: { default: 0 },
  flags: { [MODULE_ID]: { completeCampaign: true } },
  _stats: stats()
};
await writePack("adventure", [{ key: `!adventures!${adventureId}`, value: adventure }]);

console.log(`Packaged ${mapDefinitions.length} Scene maps and ${handoutFiles.length} handouts`);
console.log(`Packaged ${actorRoots.length} actors, ${journalRoots.length} journals, and ${sceneRoots.length} scenes`);
