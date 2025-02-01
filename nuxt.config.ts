// the echo versioning system
import { execSync } from "child_process";
const cmSha = execSync("git rev-parse --short HEAD").toString();
const cmDate = new Date(parseInt(execSync("git log -1 --format=%ct").toString().trim()) * 1000).toISOString();

import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      htmlAttrs: {
        lang: "en",
      },
      title: "HCBScan - The HCB Explorer",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "HCBScan - The HCB Explorer",
        },
      ],
    },
  },
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      sha: cmSha,
      date: cmDate,
    },
  },
});
