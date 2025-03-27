// Tool to fetch recent activities from the HCB API and save them to the database
import { apiClient } from "./apiConfig.js";
import { supabaseAdmin } from "./supabase-admin.js";

// CONFIG OPTIONS
const HCB_DOMAIN = "hcb.hackclub.com";
const MAX_PAGES = 1;
const PER_PAGE = 15;

function time() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

async function yoinkPage(page) {
  try {
    console.log(`[${time()}] yoinking page ${page}...`);

    const response = await apiClient.get(
      `https://${HCB_DOMAIN}/api/v3/activities?page=${page}&per_page=${PER_PAGE}`
    );

    const activities = response.data;
    console.log(
      `[${time()}] yoinked ${activities.length} rows from page ${page}`
    );
    return activities;
  } catch (error) {
    console.error(`[${time()}] problem yoinking page ${page}: `, error.message);
    console.error(`${error.response?.status}, raw:`, error.response?.data);
    return [];
  }
}

async function yoinkAllPages() {
  console.log(`[${time()}] starting yoinking (max ${MAX_PAGES} pages)`);

  const allActivities = [];
  let hasMoreData = true;
  let page = 1;

  while (hasMoreData && page <= MAX_PAGES) {
    const activities = await yoinkPage(page);

    if (activities.length === 0) {
      console.log(`[${time()}] no more rows found, stopping at page ${page}`);
      hasMoreData = false;
    } else {
      allActivities.push(...activities);

      // If we got fewer activities than requested, we're at the end
      if (activities.length < PER_PAGE) {
        console.log(`[${time()}] reached end of rows at page ${page}`);
        hasMoreData = false;
      }

      page++;
    }
  }

  console.log(
    `[${time()}] finished yoinking ${allActivities.length} total rows from ${
      page - 1
    } pages`
  );
  return allActivities;
}

async function sync(activities) {
  const actMap = new Map();

  activities.forEach((activity) => {
    actMap.set(activity.id, activity);
  });

  const unique = Array.from(actMap.values());
  console.log(
    `[${time()}] yoinked ${activities.length} rows, ${unique.length} unique (${
      activities.length - unique.length
    } dupes)`
  );

  const formatted = unique.map((activity) => ({
    "Activity ID": activity.id,
    Key: activity.key,
    "Created At": activity.created_at,
    "User ID": activity.user?.id || null,
    "User Name": activity.user?.full_name || null,
    "User Photo": activity.user?.photo || null,
    "Organization ID": activity.organization?.id || null,
    "Organization Name": activity.organization?.name || null,
    "Organization Logo": activity.organization?.logo || null,
    "Last Updated": new Date().toISOString(),
  }));

  console.log(`[${time()}] starting sync for ${formatted.length} rows`);

  try {
    const { data, error } = await supabaseAdmin
      .from("hcb.hackclub.com-acts")
      .upsert(formatted, {
        onConflict: "Activity ID",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`[${time()}] fucked up in batch: `, error.message);
      return false;
    }

    console.log(`[${time()}] imported batch successfully`);
    return true;
  } catch (error) {
    console.error(`[${time()}] fucked up in batch: `, error.message);
    return false;
  }
}

async function runSync() {
  try {
    console.log(`[${time()}] starting multi-page sync for ${HCB_DOMAIN}...`);
    const all = await yoinkAllPages();

    if (all.length === 0) {
      console.log(`[${time()}] no activities found, aborting sync`);
      return false;
    }

    const success = await sync(all);
    console.log(
      `[${time()}] sync ${
        success ? "completed successfully" : "had errors"
      } for ${HCB_DOMAIN}`
    );
    return success;
  } catch (error) {
    console.error(`[${time()}] sync failed for ${HCB_DOMAIN}: `, error.message);
    return false;
  }
}

runSync();
