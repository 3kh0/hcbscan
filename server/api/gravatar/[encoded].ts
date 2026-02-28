export default defineEventHandler(async (event) => {
  const encoded = getRouterParam(event, "encoded");
  const method = getMethod(event);

  if (!encoded) {
    throw createError({
      statusCode: 400,
      statusMessage: "missing payload",
    });
  }

  let target: string;
  try {
    target = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "invalid payload",
    });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "invalid URL",
    });
  }

  const isAllowedHost =
    targetUrl.hostname === "gravatar.com" ||
    targetUrl.hostname.endsWith(".gravatar.com");

  if (!isAllowedHost || !targetUrl.pathname.startsWith("/avatar/")) {
    throw createError({
      statusCode: 403,
      statusMessage: "forbidden URL",
    });
  }

  const upstream = await fetch(targetUrl.toString(), {
    method: method === "HEAD" ? "HEAD" : "GET",
    redirect: "follow",
  });

  if (!upstream.ok) {
    throw createError({
      statusCode: upstream.status,
      statusMessage: `failed to fetch (${upstream.status})`,
    });
  }

  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");
  const etag = upstream.headers.get("etag");
  const lastModified = upstream.headers.get("last-modified");

  if (contentType) setResponseHeader(event, "content-type", contentType);
  if (cacheControl) setResponseHeader(event, "cache-control", cacheControl);
  if (etag) setResponseHeader(event, "etag", etag);
  if (lastModified) setResponseHeader(event, "last-modified", lastModified);

  if (method === "HEAD") {
    return;
  }

  const body = await upstream.arrayBuffer();
  return Buffer.from(body);
});
