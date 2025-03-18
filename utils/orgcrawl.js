// tool to manually grab all orgs and their balances from the api
// and then sync them to the supabase table using service role
import axios from "axios";
import { supabaseAdmin } from "./supabase-admin.js";

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
        `https://hcb.hackclub.com/api/v3/organizations?page=${page}&per_page=100`
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

  for (let i = 0; i < formatted.length; i += 100) {
    const batch = formatted.slice(i, i + 100);
    const { data, error } = await supabaseAdmin.from("orgs").upsert(batch, {
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
    console.log(`[${time()}] starting sync...`);
    const all = await yoink();
    await sync(all);
    console.log(`[${time()}] sync done`);
    return true;
  } catch (error) {
    console.error(`[${time()}] sync failed `, error.message);
    return false;
  }
}

runSync();

export { runSync };
