// tool to manually grab all orgs and their balances from the api
// the csv is later uploaded into supabase manually
// working on automating this

import axios from "axios";
import fs from "fs";
import { Parser } from "json2csv";

const out = "orgs.csv";

const fields = [
  { label: "Organization ID", value: "id" },
  { label: "Name", value: "name" },
  { label: "Slug", value: "slug" },
  { label: "Category", value: "category" },
  { label: "Balance", value: (row) => row.balances.balance_cents },
];

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

async function save(data) {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    fs.writeFileSync(out, csv);
    console.log(`[${time()}] saved to ${out}`);
  } catch (error) {
    console.error(`[${time()}] ah fuck it broke `, error.message);
  }
}

(async () => {
  try {
    const all = await yoink();
    await save(all);
    console.log(`[${time()}] fin`);
  } catch (error) {
    console.error(`[${time()}] ah fuck it broke `, error.message);
    process.exit(1);
  }
})();
