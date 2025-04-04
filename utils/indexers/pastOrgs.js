import { apiClient } from "../apiConfig.js";
import { supabaseAdmin } from "../supabase/supabase-admin.js";

function time() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

async function update() {
  const threezero = new Date();
  threezero.setMinutes(threezero.getMinutes() - 30);
  const threezeroISO = threezero.toISOString();

  console.log(
    `[${time()}] checking for nulls and entries older than ${threezeroISO}`
  );

  const { data, error } = await supabaseAdmin
    .from("hcb.hackclub.com")
    .select('"Organization ID", Added')
    .or(`Added.is.null,Added.lt.${threezeroISO}`);

  if (error) {
    console.error(`[${time()}] ah fuck it broke`, error.message);
    throw error;
  }

  const nullCount = data.filter((item) => item.Added === null).length;
  const outdatedCount = data.length - nullCount;

  console.log(
    `[${time()}] found ${
      data.length
    } that need updating (${nullCount} nulls, ${outdatedCount} outdated)`
  );
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

async function syncupdated(updated) {
  console.log(`[${time()}] starting sync for ${updated.length} rows`);

  for (let i = 0; i < updated.length; i += 100) {
    const batch = updated.slice(i, i + 100);
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

    if (i + 100 < updated.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(`[${time()}] sync done`);
}

async function sync() {
  try {
    console.log(`[${time()}] starting updates`);

    const orgsToUpdate = await update();

    const updated = [];
    for (const org of orgsToUpdate) {
      const updatedOrg = await yoink(org["Organization ID"]);
      if (updatedOrg) {
        updated.push(updatedOrg);
      }
    }

    if (updated.length > 0) {
      await syncupdated(updated);
    } else {
      console.log(`[${time()}] none to update!`);
    }

    console.log(`[${time()}] we cool`);
  } catch (error) {
    console.error(`[${time()}] ah shit it broke`, error.message);
  }
}

sync();
