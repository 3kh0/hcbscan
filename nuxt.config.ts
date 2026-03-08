import tailwindcss from "@tailwindcss/vite";

const cmSha = process.env.SOURCE_COMMIT?.slice(0, 7) || "unknown";
const cmDate = new Date().toISOString();
const imageDomains = [
  "bank-hackclub.s3.amazonaws.com",
  "i2.wp.com",
  "hcb.hackclub.com",
  "gravatar.com",
  "hcbscan.3kh0.net",
  "localhost:3000",
  "127.0.0.1:3000",
  process.env.COOLIFY_FQDN,
].filter((domain): domain is string => Boolean(domain));
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
        { property: "og:url", content: "https://hcbscan.3kh0.net" },
        {
          property: "og:image",
          content: "https://hcbscan.3kh0.net/readme.png",
        },
        { property: "og:image:width", content: "512" },
        { property: "og:image:height", content: "512" },
        { property: "og:image:type", content: "image/png" },
        { name: "twitter:card", content: "summary" },
        {
          name: "twitter:image",
          content: "https://hcbscan.3kh0.net/readme.png",
        },
      ],
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  modules: ["@nuxt/image"],
  image: {
    domains: imageDomains,
  },
  compatibilityDate: "2026-02-27",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: {
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
    public: {
      sha: cmSha,
      date: cmDate,
    },
  },
  nitro: {
    externals: {
      inline: ["ofetch", "node-fetch-native", "destr", "ufo"],
    },
    experimental: { tasks: true },
    scheduledTasks: {
      "0 * * * *": ["index-orgs"],
      "*/5 * * * *": ["index-past-orgs"],
      "* * * * *": ["index-acts"],
    },
  },
});
