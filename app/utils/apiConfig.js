export function buildApiUrl(endpoint) {
  const base = "https://hcb.hackclub.com";
  const fixup = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${fixup}`;
}

export function hcbFetch(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  return fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "X-HCBScan": "1.0",
      ...options.headers,
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`HCB API error: ${res.status}`);
    return res.json();
  });
}
