#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Usage: node tools/extract-chatgpt-share.mjs <page.html> <output.json>");
  process.exit(1);
}

const html = await readFile(inputPath, "utf8");
const chunks = [...html.matchAll(/streamController\.enqueue\("((?:\\.|[^"\\])*)"\)/g)]
  .map((match) => JSON.parse(`"${match[1]}"`));

if (!chunks.length) {
  throw new Error("No embedded stream data was found in the shared ChatGPT page.");
}

const payload = JSON.parse(chunks[0]);
const cache = new Map();

function special(index) {
  switch (index) {
    case -1: return undefined;
    case -2: return Symbol.for("turbo-stream.hole");
    case -3: return Number.NaN;
    case -4: return Number.POSITIVE_INFINITY;
    case -5: return null;
    case -6: return -0;
    default: return undefined;
  }
}

function hydrate(reference) {
  if (typeof reference !== "number") return reference;
  if (reference < 0) return special(reference);
  if (cache.has(reference)) return cache.get(reference);

  const value = payload[reference];
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    // Remix uses a self-referential ["P", index] tuple for a streamed
    // promise placeholder. The public share payload has already delivered
    // the useful route data, so represent unresolved placeholders as null.
    if (value[0] === "P") {
      cache.set(reference, null);
      return null;
    }
    const result = [];
    cache.set(reference, result);
    for (const item of value) {
      const hydrated = hydrate(item);
      if (hydrated !== Symbol.for("turbo-stream.hole")) result.push(hydrated);
    }
    return result;
  }

  const result = {};
  cache.set(reference, result);
  for (const [encodedKey, encodedValue] of Object.entries(value)) {
    const keyMatch = /^_(\d+)$/.exec(encodedKey);
    const key = keyMatch ? payload[Number(keyMatch[1])] : encodedKey;
    result[key] = hydrate(encodedValue);
  }
  return result;
}

const decoded = hydrate(0);
await writeFile(outputPath, `${JSON.stringify(decoded, null, 2)}\n`, "utf8");
console.log(`Decoded ${payload.length} values into ${outputPath}`);
