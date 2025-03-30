import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

export const supabaseAdmin = createClient(
  "https://gmtafnkeeufkevbeoazv.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
