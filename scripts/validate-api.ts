#!/usr/bin/env bun
// i stole this shit from somewhere
// run: bun run scripts/validate-openapi.ts

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const METHODS = ["get", "post", "put", "patch", "delete"];
const METHOD_RE = /\.(get|post|put|patch|delete)\.ts$/;
const ROOT = join(import.meta.dirname, "..");
const DIR = join(ROOT, "server", "api", "v1");
const spec = JSON.parse(readFileSync(join(ROOT, "public", "api", "v1", "openapi.json"), "utf-8"));

function scan(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const f = join(dir, e);
    return statSync(f).isDirectory() ? scan(f) : METHOD_RE.test(e) ? [f] : [];
  });
}

function toAPI(file: string): { path: string; method: string } {
  const r = relative(DIR, file);
  const method = r.match(METHOD_RE)?.[1] ?? "get";
  const route = r.replace(METHOD_RE, "").replace(/\/index$|^index$/, "").replace(/\[([^\]]+)\]/g, "{$1}");
  return { path: "/" + route, method };
}

const routes = scan(DIR).map(toAPI);
const routeKeys = new Set(routes.map((r) => `${r.method}:${r.path}`));
const errs: string[] = [];

// Build spec path -> methods map
const specPaths = new Map<string, Set<string>>();
for (const [p, m] of Object.entries(spec.paths || {}))
  specPaths.set(p, new Set(Object.keys(m as object).filter((k) => METHODS.includes(k))));

// Check routes vs spec
for (const { path: p, method: m } of routes) {
  const s = specPaths.get(p);
  if (!s) errs.push(`route not in spec: ${m.toUpperCase()} ${p}`);
  else if (!s.has(m)) errs.push(`method not in spec: ${m.toUpperCase()} ${p}`);
}

// Check spec vs routes
for (const [p, methods] of specPaths)
  for (const m of methods)
    if (!routeKeys.has(`${m}:${p}`)) errs.push(`spec path has no route: ${m.toUpperCase()} ${p}`);

for (const [p, methods] of Object.entries(spec.paths || {}))
  for (const [m, op] of Object.entries(methods as Record<string, any>)) {
    if (!METHODS.includes(m)) continue;
    const tag = `${m.toUpperCase()} ${p}`;
    if (!op.operationId) errs.push(`missing operationId: ${tag}`);
    if (!op.summary) errs.push(`missing summary: ${tag}`);
    if (!op.responses || !Object.keys(op.responses).length) errs.push(`missing responses: ${tag}`);
  }

// Report
console.log(`\nstats:`);
console.log(`   Routes: ${routes.length}  Spec paths: ${specPaths.size}\n`);

if (!errs.length) {
  console.log("docs are in sync\n");
} else {
  console.log(`Found ${errs.length} issue(s):\n`);
  errs.forEach((e) => console.log(`  ${e}`));
  console.log();
  process.exit(1);
}
