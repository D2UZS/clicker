import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yqazrynowqjkuidenscg.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYXpyeW5vd3Fqa3VpZGVuc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NDUwMDYsImV4cCI6MjA1NTAyMTAwNn0.ajVTq1mhpQe--7sBGyOwR_qkrHuZW9lj-04e39HyFjo";

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

export default supabase;
