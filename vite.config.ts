import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig, type Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";

// Files that are only for crawlers, hosting, or the worker itself.
const NOT_PRECACHED = new Set([
  "sw.js",
  "_headers",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "og-image.png",
]);

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
}

// Emits dist/sw.js listing every built file, so the game loads offline.
function offlineServiceWorker(): Plugin {
  let outDir = "dist";
  return {
    name: "offline-service-worker",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    writeBundle() {
      const files = listFiles(outDir)
        .map((file) => relative(outDir, file).split("\\").join("/"))
        .filter((file) => !NOT_PRECACHED.has(file))
        .sort();
      const hash = createHash("sha256");
      for (const file of files) {
        hash.update(file).update(readFileSync(join(outDir, file)));
      }
      // The page is cached under both "/" and "/index.html".
      const urls = ["/", ...files.map((file) => `/${file}`)];
      const template = readFileSync("scripts/service-worker.template.js", "utf8");
      writeFileSync(
        join(outDir, "sw.js"),
        template
          .replace("__CACHE_NAME__", `hkg-${hash.digest("hex").slice(0, 12)}`)
          .replace("__PRECACHE_URLS__", JSON.stringify(urls, null, 2)),
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  test: { environment: "node" },
});
