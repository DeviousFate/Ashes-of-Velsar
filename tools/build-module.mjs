#!/usr/bin/env node

import { createRequire } from "node:module";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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
  npcs: "AoVNpcDirectory1"
};
const adventureId = "AoVAdventure0001";
const adventureJournalId = "RQiN0Cs1B9S1UZZE";
const quickReferenceId = "0031X75piojXUkIM";
const handoutsId = "5PyjVzBeImPu8J7N";
const gmMapPageId = "AoVGmMapPage0001";

const chapterPages = {
  chapter1: "vD2jM2BNpIIqr8Wg",
  chapter2: "q6HWcF0HXeZIYbQm",
  chapter3: "btRQ1OLEMeBDGO4V",
  chapter4: "FhjNIxVzJXf2tddR",
  overview: "sfDsrbbFy44go2KT"
};

const mapDefinitions = [
  { id: "xk0d9gBiaJHvZewJ", name: "01 — Abandoned Compressor Station and Eastern Scrapyard", file: "1 Abandoned Compressor Station and Eastern Scrapyard.png", slug: "01-abandoned-compressor-station.png", folder: "side", page: "chapter1" },
  { id: "MkBY37RL9t0H1cqF", name: "02 — The Bent Spanner Cantina", file: "2 The Bent Spanner Cantina.png", slug: "02-the-bent-spanner-cantina.png", folder: "chapter1", page: "chapter1" },
  { id: "6vbTdZx3xrxOVgP6", name: "03 — Ressik’s Rustclaw Hideout", file: "3 Ressik’s Rustclaw Hideout.png", slug: "03-ressiks-rustclaw-hideout.png", folder: "chapter2", page: "chapter2" },
  { id: "Cdc4vsuci2jeqQJN", name: "04 — Doctor Vey’s Clinic", file: "4 Doctor Vey’s Clinic.png", slug: "04-doctor-veys-clinic.png", folder: "side", page: "chapter2" },
  { id: "EL02sxuRACXvwSXT", name: "05 — Southern Cut Imperial Checkpoint", file: "5 Southern Cut Imperial Checkpoint.png", slug: "05-southern-cut-checkpoint.png", folder: "chapter4", page: "chapter4" },
  { id: "MrN6tvX9p3j4aXs4", name: "06 — Crashed Transport Site", file: "6 Crashed Transport Site.png", slug: "06-crashed-transport-site.png", folder: "chapter3", page: "chapter3" },
  { id: "Qen9gVMLOpISn9Pk", name: "07 — Tovan Rell’s Hidden Refuge", file: "7 Tovan Rell’s Hidden Refuge.png", slug: "07-tovan-rells-hidden-refuge.png", folder: "chapter3", page: "chapter3" },
  { id: "jLuD2jD9RKIcsMaJ", name: "08 — Prisoner Transfer Ambush Site", file: "8 Prisoner Transfer Ambush Site.png", slug: "08-prisoner-transfer-ambush.png", folder: "chapter4", page: "chapter4" },
  { id: "nZOXeCzRCNObMGNa", name: "09 — Davik Renn’s Hidden Stargazer Hangar", file: "9 Davik Renn’s Hidden Stargazer Hangar.png", slug: "09-stargazer-hangar.png", folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00010", name: "10 — Administration Square and Imperial Detention Center", file: "10 Administration Square and Imperial Detention Center.png", slug: "10-administration-square.png", folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00011", name: "11 — Workers’ Blocks Evacuation", file: "11 Workers’ Blocks Evacuation.png", slug: "11-workers-blocks-evacuation.png", folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00012", name: "12 — Market Row During the Purge", file: "12 Market Row During the Purge.png", slug: "12-market-row-purge.png", folder: "chapter4", page: "chapter4" },
  { id: "AoVSceneMap00013", name: "13 — Desert Shrine", file: "13 Desert Shrine.png", slug: "13-desert-shrine.png", folder: "side", page: "chapter3" },
  { id: "AoVSceneMap00014", name: "14 — Broken Beacon Escape Pod Site", file: "14 Broken Beacon Escape Pod Site.png", slug: "14-broken-beacon.png", folder: "side", page: "chapter3" }
];

const handoutFiles = [
  ["Arrival at Bracken’s Point.png", "arrival-at-brackens-point.png"],
  ["Bracken's Point GM Map.png", "brackens-point-gm-map.png"],
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

function makeJournalRoot(id, name, pages, sort) {
  return {
    _id: id,
    name,
    pages,
    folder: journalFolderId,
    categories: [],
    sort,
    ownership: { default: 0 },
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
<p>Use the installed SW5E compendiums for rules, equipment, powers, conditions, and standard adversaries. The campaign pack contains only Velsar-specific actors.</p>
<ul>
<li><a href="https://sw5e.com/rules">Official SW5E Rules</a></li>
<li><a href="https://github.com/sw5e-foundry/sw5e-module">SW5E Foundry Module</a></li>
</ul>`;
}

function sceneIndexHtml() {
  const items = mapDefinitions.map((scene) =>
    `<li>@UUID[${compendiumUuid("scenes", "Scene", scene.id)}]{${scene.name}}</li>`
  ).join("\n");
  return `<h1>Scene Index</h1><p>The numbered scenes follow their recommended campaign order. Every imported scene includes a journal pin in its upper-left corner.</p><ol>${items}</ol>`;
}

function npcDirectoryHtml(actorRoots) {
  const items = actorRoots
    .sort((a, b) => a.value.name.localeCompare(b.value.name))
    .map(({ value }) => `<li>@UUID[${compendiumUuid("campaign", "Actor", value._id)}]{${value.name}}</li>`)
    .join("\n");
  return `<h1>Campaign Actors</h1><p>Velsar-specific NPCs and the BT-9 Stargazer are stored here. Standard SW5E adversaries remain in the SW5E module’s compendiums.</p><ul>${items}</ul>`;
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
    scene[collection] = (root[collection] ?? []).map((id) =>
      deepClone(recordMap.get(`!scenes.${collection}!${root._id}.${id}`))
    ).filter(Boolean);
  }
  return scene;
}

const [sourceActors, sourceJournals, sourceScenes] = await Promise.all([
  readJson("source/world/actors.json"),
  readJson("source/world/journals.json"),
  readJson("source/world/scenes.json")
]);

for (const scene of mapDefinitions) {
  await copyAsset(path.join(worldImagePath, "Maps", scene.file), path.join("assets", "maps", scene.slug));
}
await copyAsset(path.join(worldImagePath, "Maps", "Diagram.png"), path.join("assets", "maps", "bt-9-stargazer-diagram.png"));
for (const [sourceName, targetName] of handoutFiles) {
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

const handoutRoot = journalRecords.find(({ key }) => key === `!journal!${handoutsId}`).value;
handoutRoot.pages.push(gmMapPageId);
journalRecords.push({
  key: `!journal.pages!${handoutsId}.${gmMapPageId}`,
  value: {
    _id: gmMapPageId,
    name: "Bracken’s Point GM Map",
    type: "image",
    sort: 1200000,
    title: { show: true, level: 1 },
    image: { alignment: "center", caption: "" },
    text: { format: 1, content: "", markdown: "" },
    video: { controls: true, volume: 0.5 },
    src: `${MODULE_PATH}/assets/handouts/brackens-point-gm-map.png`,
    system: {},
    ownership: { default: -1 },
    flags: { [MODULE_ID]: { gmOnly: true } },
    _stats: stats()
  }
});

const actorRootPreview = sourceActors
  .filter(({ key }) => /^!actors![^!]+$/.test(key))
  .map(({ key, value }) => ({ key, value: deepClone(value) }));
const dashboardPageRecords = [
  { id: dashboardPages.start, value: makeJournalPage(dashboardPages.start, "Start Here", dashboardHtml(), 0) },
  { id: dashboardPages.scenes, value: makeJournalPage(dashboardPages.scenes, "Scene Index", sceneIndexHtml(), 100000) },
  { id: dashboardPages.npcs, value: makeJournalPage(dashboardPages.npcs, "Campaign Actors", npcDirectoryHtml(actorRootPreview), 200000) }
];
journalRecords.push({ key: `!journal!${dashboardId}`, value: makeJournalRoot(dashboardId, "00 — Ashes of Velsar GM Dashboard", dashboardPageRecords.map(({ id }) => id), -100000) });
for (const page of dashboardPageRecords) journalRecords.push({ key: `!journal.pages!${dashboardId}.${page.id}`, value: page.value });
journalRecords.push({ key: `!folders!${journalFolderId}`, value: folderDocument(journalFolderId, "Ashes of Velsar", "JournalEntry", 0, "#9e2b25") });

const sceneSourceRoots = new Map(sourceScenes
  .filter(({ key }) => /^!scenes![^!]+$/.test(key))
  .map(({ value }) => [value._id, value]));
const sceneTemplate = sceneSourceRoots.get(mapDefinitions[0].id);
if (!sceneTemplate) throw new Error("The source snapshot does not contain a Scene template.");

const sceneRecords = [];
for (const [index, definition] of mapDefinitions.entries()) {
  const scene = deepClone(sceneSourceRoots.get(definition.id) ?? sceneTemplate);
  const backgroundPath = `${MODULE_PATH}/assets/maps/${definition.slug}`;
  const note = makeSceneNote(definition, index);
  scene._id = definition.id;
  scene.name = definition.name;
  scene.folder = sceneFolderIds[definition.folder];
  scene.active = false;
  scene.navigation = false;
  scene.navName = "";
  scene.navOrder = index * 10;
  scene.width = 1448;
  scene.height = 1086;
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
  scene.grid = { ...(scene.grid ?? {}), type: 0, size: 72, distance: 5, units: "ft" };
  scene.tokens = [];
  scene.walls = [];
  scene.lights = [];
  scene.sounds = [];
  scene.templates = [];
  scene.tiles = [];
  scene.drawings = [];
  scene.regions = [];
  scene.notes = [note.id];
  scene.flags = { ...scene.flags, [MODULE_ID]: { chapter: definition.page, sourceMap: definition.file } };
  scene._stats = stats(scene._stats?.compendiumSource ?? null);
  sceneRecords.push({ key: `!scenes!${definition.id}`, value: scene });
  sceneRecords.push({ key: `!scenes.notes!${definition.id}.${note.id}`, value: note.value });
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

const actorRecords = sourceActors.map(({ key, value }) => ({ key, value: deepClone(value) }));
for (const record of actorRecords) {
  const rootMatch = /^!actors!([^!]+)$/.exec(record.key);
  if (!rootMatch) {
    if (record.value?._stats) record.value._stats = stats(record.value._stats.compendiumSource ?? null);
    continue;
  }
  const actor = record.value;
  if (!actorIds.has(actor._id)) continue;
  actor.folder = actor._id === "0ml1uw24lJevFdH1"
    ? actorFolderIds.vehicles
    : imperialActorIds.has(actor._id) ? actorFolderIds.imperial : actorFolderIds.campaign;
  actor.flags = { ...actor.flags, [MODULE_ID]: { campaignActor: true } };
  actor._stats = stats(actor._stats?.compendiumSource ?? null);

  if (actor._id === "0ml1uw24lJevFdH1") {
    actor.img = `${MODULE_PATH}/assets/maps/bt-9-stargazer-diagram.png`;
    if (actor.prototypeToken?.texture) actor.prototypeToken.texture.src = actor.img;
    continue;
  }

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
  img: `${MODULE_PATH}/assets/handouts/arrival-at-brackens-point.png`,
  caption: "Arrival at Bracken’s Point",
  sort: 0,
  description: "<p><strong>A complete SW5E adventure for four to six characters of 1st–4th level.</strong></p><p>Import this Adventure to create the campaign journals, player handouts, fourteen scenes, sixteen NPCs, the BT-9 Stargazer, folders, and linked scene journal pins.</p>",
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

console.log(`Copied ${mapDefinitions.length} maps and ${handoutFiles.length} handouts`);
console.log(`Packaged ${actorRoots.length} actors, ${journalRoots.length} journals, and ${sceneRoots.length} scenes`);
