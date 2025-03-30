import { createClient } from "@supabase/supabase-js";

const url = "https://gmtafnkeeufkevbeoazv.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdGFmbmtlZXVma2V2YmVvYXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NjgwOTYsImV4cCI6MjA1MzQ0NDA5Nn0.ALipP83S0gLlbHlCXHRqlSS90jf1DXS4sOvjSekVgQw";

export const supabase = createClient(url, key);
