export function getApiDomain() {
  if (process.server) return "https://hcb.hackclub.com";

  return localStorage.getItem("hcb-domain") || "https://hcb.hackclub.com";
}

export function setApiDomain(domain) {
  if (!domain) {
    localStorage.removeItem("hcb-domain");
    return "https://hcb.hackclub.com";
  }

  const fixup = domain.startsWith("http") ? domain : `https://${domain}`;

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
