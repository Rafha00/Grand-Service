import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log("SUPABASE_URL:", supabaseUrl);
console.log("ANON KEY EXISTS:", !!supabaseAnonKey);

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);