import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const DIR =
  process.env.HCB_IMAGE_CACHE_DIR ||
  join(process.cwd(), ".data", "hcb-image-cache");

mkdir(DIR, { recursive: true }).catch(() => {});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "signedId");
  const m = getMethod(event);

  if (!id || !/^[A-Za-z0-9_=-]+$/.test(id))
    throw createError({ statusCode: 400, statusMessage: "invalid signed ID" });

  const setHeaders = (ct: string) => {
    setResponseHeader(event, "content-type", ct);
    setResponseHeader(
      event,
      "cache-control",
      "public, max-age=604800, immutable"
    );
    setResponseHeader(event, "etag", `"${id}"`);
  };

  try {
    const [data, meta] = await Promise.all([
      readFile(join(DIR, id)),
      readFile(join(DIR, `${id}.meta`), "utf8").then(JSON.parse),
    ]);
    setHeaders(meta.contentType || "image/jpeg");
    if (m === "HEAD") return;
    return data;
  } catch {}

  const res = await fetch(
    `https://hcb.hackclub.com/storage/blobs/redirect/${id}/file`,
    { method: m === "HEAD" ? "HEAD" : "GET", redirect: "follow" }
  );

  if (!res.ok)
    throw createError({
      statusCode: res.status,
      statusMessage: `upstream error (${res.status})`,
    });

  const ct = res.headers.get("content-type") || "image/jpeg";
  setHeaders(ct);
  if (m === "HEAD") return;

  const buf = Buffer.from(await res.arrayBuffer());

  Promise.all([
    writeFile(join(DIR, id), buf),
    writeFile(join(DIR, `${id}.meta`), JSON.stringify({ contentType: ct })),
  ]).catch(() => {});

  return buf;
});
