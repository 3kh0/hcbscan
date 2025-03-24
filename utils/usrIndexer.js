import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { supabaseAdmin } from "./supabase-admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CONFIG OPTIONS
const HCB_DOMAIN = "hcb.hackclub.com";
const USER_TABLE = `${HCB_DOMAIN}-users`;

function time() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
  });
}

async function process() {
  try {
    const usrPath = path.join(__dirname, "..", "users.json");
    const usrData = JSON.parse(fs.readFileSync(usrPath, "utf8"));

    console.log(`[${time()}] loaded ${usrData.length} users`);

    const formatted = usrData.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      orgs: user.orgs,
    }));

    return await sync(formatted);
  } catch (error) {
    console.error(`[${time()}] ah shit it broke:`, error.message);
    return false;
  }
}

async function sync(users) {
  console.log(`[${time()}] starting sync for ${users.length} users`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < users.length; i += 100) {
    const batch = users.slice(i, i + 100);

    const { data, error } = await supabaseAdmin.from(USER_TABLE).upsert(batch, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(
        `[${time()}] error in batch ${i / 100 + 1}:`,
        error.message
      );
      errors += batch.length;
    } else {
      console.log(
        `[${time()}] imported batch ${i / 100 + 1} (${batch.length} users)`
      );
      success += batch.length;
    }

    // play nice with supabase api limits
    if (i + 100 < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log(
    `[${time()}] user sync done. success: ${success}, errors: ${errors}`
  );
  return true;
}

process();
