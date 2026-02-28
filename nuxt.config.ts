const cmSha = process.env.SOURCE_COMMIT?.slice(0, 7) || "unknown";
const cmDate = new Date().toISOString();

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
          name: "description",
          content:
            "The first public explorer for HCB transactions and organizations.",
        },
        { name: "theme-color", content: "#09090b" },
        { property: "og:site_name", content: "HCBScan" },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://hcbscan.3kh0.net/hcbscan.png" },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:image",
          content: "https://hcbscan.3kh0.net/hcbscan.png",
        },
      ],
    },
  },
  compatibilityDate: "2026-02-27",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    public: {
      sha: cmSha,
      date: cmDate,
    },
  },
  nitro: {
    experimental: { tasks: true },
    scheduledTasks: {
      "0 */3 * * *": ["index-past-orgs"],
      "*/30 * * * * *": ["index-acts"],
    },
  },
});
