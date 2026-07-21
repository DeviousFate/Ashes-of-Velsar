#!/usr/bin/env node

import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";

const [databasePath, outputPath, foundryAppPath] = process.argv.slice(2);

if (!databasePath || !outputPath || !foundryAppPath) {
  console.error("Usage: node tools/dump-foundry-leveldb.mjs <database> <output.json> <foundry-app>");
  process.exit(1);
}

const require = createRequire(`${foundryAppPath.replace(/[\\/]$/, "")}/package.json`);
const { ClassicLevel } = require("classic-level");
const database = new ClassicLevel(databasePath, {
  keyEncoding: "utf8",
  valueEncoding: "json",
  readOnly: true
});

const documents = [];
try {
  await database.open();
  for await (const [key, value] of database.iterator()) {
    documents.push({ key, value });
  }
} finally {
  await database.close();
}

await writeFile(outputPath, `${JSON.stringify(documents, null, 2)}\n`, "utf8");
console.log(`Exported ${documents.length} records into ${outputPath}`);
