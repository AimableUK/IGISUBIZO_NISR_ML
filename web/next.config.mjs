import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let loadEnvConfig;
try {
  ({ loadEnvConfig } = require("@next/env"));
} catch {
  ({ loadEnvConfig } = require(
    path.resolve(here, "node_modules/.pnpm/@next+env@15.5.27/node_modules/@next/env")
  ));
}
loadEnvConfig(here);
loadEnvConfig(path.resolve(here, ".."));

/** @type {import('next').NextConfig} */
export default {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
      ],
    }];
  },
};
