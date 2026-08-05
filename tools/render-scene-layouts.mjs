#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { sceneLayouts } from "../source/scene-layouts.mjs";

const ROOT = process.cwd();
const OUTPUT = path.join(tmpdir(), "ashes-of-velsar-layout-previews");
const colors = {
  solid: "#ff3b30",
  doors: "#34c759",
  secretDoors: "#ff2dce",
  windows: "#00d9ff",
  terrain: "#ffd60a",
  barriers: "#0a84ff"
};

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function lines(chains, color, dashed = false) {
  const output = [];
  for (const chain of chains ?? []) {
    for (let index = 0; index <= chain.length - 4; index += 2) {
      output.push(`<line x1="${chain[index]}" y1="${chain[index + 1]}" x2="${chain[index + 2]}" y2="${chain[index + 3]}" stroke="${color}" stroke-width="4" stroke-linecap="round"${dashed ? ' stroke-dasharray="10 7"' : ""}/>`);
    }
  }
  return output.join("\n");
}

function segments(chains = []) {
  const output = [];
  for (const chain of chains) {
    for (let index = 0; index <= chain.length - 4; index += 2) output.push(chain.slice(index, index + 4));
  }
  return output;
}

function subtractOne(segment, cutter) {
  const [x1, y1, x2, y2] = segment;
  const [cx1, cy1, cx2, cy2] = cutter;
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lengthSquared = vx * vx + vy * vy;
  const cross1 = vx * (cy1 - y1) - vy * (cx1 - x1);
  const cross2 = vx * (cy2 - y1) - vy * (cx2 - x1);
  if (!lengthSquared || Math.abs(cross1) > 0.01 || Math.abs(cross2) > 0.01) return [segment];
  const projection = (x, y) => ((x - x1) * vx + (y - y1) * vy) / lengthSquared;
  const start = Math.max(0, Math.min(projection(cx1, cy1), projection(cx2, cy2)));
  const end = Math.min(1, Math.max(projection(cx1, cy1), projection(cx2, cy2)));
  if (end - start <= 0.0001) return [segment];
  const point = (position) => [x1 + vx * position, y1 + vy * position];
  const output = [];
  if (start > 0.0001) output.push([x1, y1, ...point(start)]);
  if (end < 0.9999) output.push([...point(end), x2, y2]);
  return output;
}

function resolvedLayout(layout) {
  const replacement = [...segments(layout.doors), ...segments(layout.secretDoors), ...segments(layout.windows)];
  let solid = segments(layout.solid);
  for (const cutter of replacement) solid = solid.flatMap((segment) => subtractOne(segment, cutter));
  return { ...layout, solid: solid.map((segment) => segment) };
}

await mkdir(OUTPUT, { recursive: true });
for (const [slug, layout] of Object.entries(sceneLayouts)) {
  const background = await readFile(path.join(ROOT, "assets", "maps", "dungeondraft", slug));
  const width = background.readUInt32BE(16);
  const height = background.readUInt32BE(20);
  const geometry = "";
  const tokens = (layout.tokens ?? []).map((token, index) => {
    const cx = token.x + 36;
    const cy = token.y + 36;
    const color = token.disposition === 1 ? "#30d158" : token.disposition === 0 ? "#ffd60a" : "#ff453a";
    return `<g><circle cx="${cx}" cy="${cy}" r="29" fill="${color}" fill-opacity="0.36" stroke="${color}" stroke-width="4"${token.hidden ? ' stroke-dasharray="8 5"' : ""}/><text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#fff" stroke="#000" stroke-width="4" paint-order="stroke">${escapeXml(index + 1)}</text></g>`;
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<image width="${width}" height="${height}" href="data:image/png;base64,${background.toString("base64")}"/>
<g opacity="0.92">${geometry}</g>
<g>${tokens}</g>
</svg>`;
  await writeFile(path.join(OUTPUT, slug.replace(/\.png$/i, ".svg")), svg, "utf8");
}

console.log(OUTPUT);
