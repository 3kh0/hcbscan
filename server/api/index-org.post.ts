import { upsertOrg } from "../repositories/orgs";
import { upsertUsersForOrg } from "../repositories/users";

interface HcbOrgResponse {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  logo?: string | null;
  financially_frozen?: boolean;
  balances?: { balance_cents?: number };
  users?: Array<{ id: string; full_name: string; photo?: string | null }>;
}

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

  let orgData: HcbOrgResponse;
  try {
    const response = await fetch(
      `https://hcb.hackclub.com/api/v3/organizations/${id}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "HCBScan/1.0 (https://hcbscan.3kh0.net)",
        },
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
  } catch (err) {
    if (err && typeof err === "object" && "statusCode" in err) throw err;
    if (err instanceof Error && err.name === "AbortError") {
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
    financially_frozen: orgData.financially_frozen || false,
  });

  if (orgData.users?.length) {
    await upsertUsersForOrg(
      orgData.id,
      orgData.name,
      orgData.logo || null,
      orgData.users.map((u) => ({
        id: u.id,
        name: u.full_name,
        avatar: u.photo || null,
      }))
    );
  }

  return { success: true };
});
