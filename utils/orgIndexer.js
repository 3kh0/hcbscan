// tool to manually grab all orgs and their balances from the api
// and then sync them to the supabase table using service role
import axios from "axios";
import { supabaseAdmin } from "./supabase-admin.js";
import fs from "fs";
import path from "path";

// CONFIG OPTIONS
const HCB_DOMAIN = "hcb.hackclub.com";

function time() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

async function yoink() {
  let page = 1;
  let all = [];
  let hasMoreData = true;
  let allUsers = {};

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
        data.forEach((org) => {
          if (org.users && Array.isArray(org.users)) {
            org.users.forEach((user) => {
              if (!allUsers[user.id]) {
                allUsers[user.id] = {
                  id: user.id,
                  name: user.full_name,
                  avatar: user.photo,
                  orgs: {},
                };
              }
              allUsers[user.id].orgs[org.id] = {
                id: org.id,
                name: org.name,
                logo: org.logo || null,
              };
            });
          }
        });

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
        `[${time()}] problem yoinking page ${page}: `,
        error.message
      );
      console.error(`${error.response?.status}, raw:`, error.response?.data);
      break;
    }
  }

  const usrArray = Object.values(allUsers).map((user) => {
    user.orgs = Object.values(user.orgs);
    return user;
  });

  try {
    const usrPath = path.join(process.cwd(), "users.json");
    fs.writeFileSync(usrPath, JSON.stringify(usrArray, null, 2));
    console.log(`[${time()}] saved ${usrArray.length} rows`);
  } catch (error) {
    console.error(`[${time()}] ah shit it broke `, error.message);
  }

  console.log(
    `[${time()}] done yoinking all to be yoinked. total orgs yoinked: ${
      all.length
    }`
  );
  return all;
}

async function sync(organizations) {
  const { data: existing, error: error } = await supabaseAdmin
    .from(HCB_DOMAIN)
    .select('"Organization ID", Added')
    .is("Added", null);

  if (error) {
    console.error(`[${time()}] error fetching existing orgs:`, error.message);
  }

  const noTime = new Set();
  if (existing) {
    existing.forEach((org) => {
      noTime.add(org["Organization ID"]);
    });
  }

  const now = new Date().toISOString();

  const formatted = organizations.map((org) => {
    const formattedOrg = {
      "Organization ID": org.id,
      Name: org.name,
      Slug: org.slug,
      Category: org.category,
      Balance: org.balances?.balance_cents || 0,
    };

    if (!noTime.has(org.id)) {
      formattedOrg.Added = now;
    }

    return formattedOrg;
  });

  console.log(`[${time()}] starting sync for ${formatted.length} rows`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < formatted.length; i += 100) {
    const batch = formatted.slice(i, i + 100);
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

  console.log(`[${time()}] sync done. success ${success} error ${errors}`);
}

async function runSync() {
  try {
    console.log(`[${time()}] starting sync for ${HCB_DOMAIN}...`);
    const all = await yoink();
    await sync(all);
    console.log(`[${time()}] sync done for ${HCB_DOMAIN}...`);

    try {
      const { execSync } = await import("child_process");
      console.log(`[${time()}] starting user indexer...`);
      execSync("node utils/usrIndexer.js", { stdio: "inherit" });
    } catch (error) {
      console.error(`[${time()}] error in user indexer:`, error.message);
    }

    return true;
  } catch (error) {
    console.error(`[${time()}] sync failed for ${HCB_DOMAIN} `, error.message);
    return false;
  }
}

runSync();
