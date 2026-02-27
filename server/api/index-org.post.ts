import { upsertOrg } from "../repositories/orgs";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const id = String(body?.id || "").trim();

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Organization ID is required.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let orgData;
  try {
    const response = await fetch(
      `https://hcb.hackclub.com/api/v3/organizations/${id}`,
      {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw createError({
        statusCode: response.status === 404 ? 404 : 502,
        statusMessage:
          response.status === 404
            ? "Organization not found on HCB"
            : "Failed to fetch organization from HCB API",
      });
    }

    orgData = await response.json();
  } catch (err: any) {
    if (err.statusCode) throw err;
    if (err.name === "AbortError") {
      throw createError({
        statusCode: 504,
        statusMessage: "HCB API request timed out",
      });
    }
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to fetch organization from HCB API",
    });
  } finally {
    clearTimeout(timeout);
  }

  await upsertOrg({
    id: orgData.id,
    name: orgData.name,
    slug: orgData.slug,
    category: orgData.category || null,
    balance: orgData.balances?.balance_cents || 0,
  });

  return { success: true };
});
