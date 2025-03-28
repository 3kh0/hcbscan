import axios from "axios";

export function getApiDomain() {
  if (process.server) return "https://hcb.hackclub.com";

  return localStorage.getItem("hcb-domain") || "https://hcb.hackclub.com";
}

export function setApiDomain(domain) {
  if (!domain) {
    localStorage.removeItem("hcb-domain");
    return "https://hcb.hackclub.com";
  }

  let fixup = domain.startsWith("http") ? domain : `https://${domain}`;
  fixup = fixup.replace(/\/+$/, "");
  localStorage.setItem("hcb-domain", fixup);
  return fixup;
}

export function resetApiDomain() {
  localStorage.removeItem("hcb-domain");
  return "https://hcb.hackclub.com";
}

export function buildApiUrl(endpoint) {
  const domain = getApiDomain();
  const fixup = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${domain}${fixup}`;
}

export const apiClient = axios.create({
  headers: {
    "User-Agent": "HCBScan/1.0",
  },
});

export function handleQuery() {
  if (process.server) return;

  const d = new URLSearchParams(window.location.search);
  const a = d.get("custom_instance");

  if (a) {
    const b = a.startsWith("http") ? a : `https://${a}`;
    const c = b.replace(/\/+$/, "");
    localStorage.setItem("hcb-domain", c);
    console.log(`custom instance set to: ${c}`);
  }
}
