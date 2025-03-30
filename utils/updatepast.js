import { apiClient } from "./apiConfig.js";
import { supabaseAdmin } from "./supabase/supabase-admin.js";

function time() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

async function fetchOrgsWithNullAdded() {
  console.log(`[${time()}] what do we need to update today?`);
  const { data, error } = await supabaseAdmin
    .from("hcb.hackclub.com")
    .select('"Organization ID"')
    .is("Added", null);

  if (error) {
    console.error(`[${time()}] ah fuck it broke`, error.message);
    throw error;
  }

  console.log(`[${time()}] found ${data.length} that need updating`);
  return data;
}

async function yoink(orgId) {
  try {
    console.log(`[${time()}] yoinking data for org ${orgId}`);
    const response = await apiClient.get(
      `https://hcb.hackclub.com/api/v3/organizations/${orgId}`
    );

    const orgData = response.data;
    const now = new Date().toISOString();

    return {
      "Organization ID": orgData.id,
      Name: orgData.name,
      Slug: orgData.slug,
      Category: orgData.category,
      Balance: orgData.balances?.balance_cents || 0,
      Added: now,
    };
  } catch (error) {
    console.error(`[${time()}] ah shit it said no no ${orgId}:`, error.message);
    return null;
  }
}

async function syncUpdatedOrgs(updatedOrgs) {
  console.log(`[${time()}] starting sync for ${updatedOrgs.length} rows`);

  for (let i = 0; i < updatedOrgs.length; i += 100) {
    const batch = updatedOrgs.slice(i, i + 100);
    const { data, error } = await supabaseAdmin
      .from("hcb.hackclub.com")
      .upsert(batch, {
        onConflict: "Organization ID",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`[${time()}] erorr saving ${i / 100 + 1}:`, error.message);
    } else {
      console.log(
        `[${time()}] saved batch ${i / 100 + 1} (${batch.length} rows)`
      );
    }

    // Respect Supabase API rate limits
    if (i + 100 < updatedOrgs.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`[${time()}] sync done`);
}

async function sync() {
  try {
    console.log(`[${time()}] starting updates`);

    // Step 1: Fetch organizations with null "Added" column
    const orgsToUpdate = await fetchOrgsWithNullAdded();

    const updatedOrgs = [];
    for (const org of orgsToUpdate) {
      const updatedOrg = await yoink(org["Organization ID"]);
      if (updatedOrg) {
        updatedOrgs.push(updatedOrg);
      }
    }

    // Step 3: Sync updated organizations back to the database
    if (updatedOrgs.length > 0) {
      await syncUpdatedOrgs(updatedOrgs);
    } else {
      console.log(`[${time()}] none to update!`);
    }

    console.log(`[${time()}] we cool`);
  } catch (error) {
    console.error(`[${time()}] ah shit it broke`, error.message);
  }
}

sync();
