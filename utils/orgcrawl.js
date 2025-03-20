// tool to manually grab all orgs and their balances from the api
// and then sync them to the supabase table using service role
import axios from "axios";
import { supabaseAdmin } from "./supabase-admin.js";
import "dotenv/config";

// CONFIG OPTIONS
const HCB_DOMAIN = "hcb.hackclub.com";
const NOTIFY_HOOK = process.env.NOTIFY_HOOK || "";
const HCBSCAN_URL = "https://hcbscan.3kh0.net";

function time() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

async function yoink() {
  let page = 1;
  let all = [];
  let hasMoreData = true;

  console.log(`[${time()}] start`);

  while (hasMoreData) {
    try {
      console.log(`[${time()}] yoinking page ${page}...`);
      const response = await axios.get(
        `https://${HCB_DOMAIN}/api/v3/organizations?page=${page}&per_page=100`
      );
      const data = response.data;

      if (data.length === 0) {
        console.log(`[${time()}] no more to yoink`);
        hasMoreData = false;
      } else {
        all = all.concat(data);
        console.log(
          `[${time()}] yoinked page ${page}, yoinked ${
            data.length
          } rows. total yoinked: ${all.length}`
        );
        page++;
      }
    } catch (error) {
      console.error(
        `[${time()}] problem yoinking page ${page}:`,
        error.message
      );
      console.error(`${error.response?.status}, raw:`, error.response?.data);
      break;
    }
  }

  console.log(
    `[${time()}] done yoinking all to be yoinked. total orgs yoinked: ${
      all.length
    }`
  );
  return all;
}

function fixMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

async function newOrg(org) {
  if (!NOTIFY_HOOK) {
    console.log(`[${time()}] no webhook, skipping notification`);
    return;
  }

  try {
    const viewUrl = `${HCBSCAN_URL}/app/org/${org["Organization ID"]}`;
    const hcbUrl = `https://${HCB_DOMAIN}/${org.Slug}`;
    const balance = fixMoney(org.Balance);
    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🆕 New Organization Found: ${org.Name}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*ID:* ${org["Organization ID"]}`,
            },
            {
              type: "mrkdwn",
              text: `*Slug:* ${org.Slug}`,
            },
            {
              type: "mrkdwn",
              text: `*Balance:* ${balance}`,
            },
          ],
        },
        {
          type: "divider",
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View on HCBScan",
                emoji: true,
              },
              url: viewUrl,
              style: "primary",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View on HCB",
                emoji: true,
              },
              url: hcbUrl,
            },
          ],
        },
      ],
    };

    await axios.post(NOTIFY_HOOK, message);
    console.log(`[${time()}] alert sent for new org! ${org.Name}`);
  } catch (error) {
    console.error(`[${time()}] ah shit it fucking broke ${error.message}`);
  }
}

async function sync(organizations) {
  const formatted = organizations.map((org) => ({
    "Organization ID": org.id,
    Name: org.name,
    Slug: org.slug,
    Category: org.category,
    Balance: org.balances?.balance_cents || 0,
  }));

  console.log(`[${time()}] starting sync for ${formatted.length} rows`);

  let success = 0;
  let errors = 0;
  let newOrgs = 0;

  const { data: existingOrgs, error: fetchError } = await supabaseAdmin
    .from(HCB_DOMAIN)
    .select('"Organization ID"');

  if (fetchError) {
    console.error(`[${time()}] shit it broke: ${fetchError.message}`);
    return;
  }
  const existingOrgIds = new Set(
    existingOrgs.map((org) => org["Organization ID"])
  );

  for (let i = 0; i < formatted.length; i += 100) {
    const batch = formatted.slice(i, i + 100);
    for (const org of batch) {
      if (!existingOrgIds.has(org["Organization ID"])) {
        console.log(
          `[${time()}] new org found: ${org.Name} (${org["Organization ID"]})`
        );
        newOrgs++;
        await newOrg(org);
        existingOrgIds.add(org["Organization ID"]);
      }
    }

    const { data, error } = await supabaseAdmin.from(HCB_DOMAIN).upsert(batch, {
      onConflict: "Organization ID",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(
        `[${time()}] fuck up in batch ${i / 100 + 1}:`,
        error.message
      );
      errors += batch.length;
    } else {
      console.log(
        `[${time()}] imported batch ${i / 100 + 1} (${batch.length} rows)`
      );
      success += batch.length;
    }

    // play nice with supabase api limits
    if (i + 100 < formatted.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(
    `[${time()}] sync done. success ${success} error ${errors} new orgs ${newOrgs}`
  );
}

async function runSync() {
  try {
    console.log(`[${time()}] starting sync for ${HCB_DOMAIN}...`);
    const all = await yoink();
    await sync(all);
    console.log(`[${time()}] sync done for ${HCB_DOMAIN}...`);
    return true;
  } catch (error) {
    console.error(`[${time()}] sync failed for ${HCB_DOMAIN} `, error.message);
    return false;
  }
}

runSync();

export { runSync };
