import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  alias: { "@shared": "./src/shared/index.ts" },
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
});
