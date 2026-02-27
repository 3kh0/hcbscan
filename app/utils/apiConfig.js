import axios from "axios";

export function buildApiUrl(endpoint) {
  const base = "https://hcb.hackclub.com";
  const fixup = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${fixup}`;
}

export const apiClient = axios.create({
  headers: {
    "User-Agent": "HCBScan/1.0",
  },
});
