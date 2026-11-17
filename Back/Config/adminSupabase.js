import { createClient } from '@supabase/supabase-js';
import './supabaseClient.js';

// client ของส่วนแอดมิน ใช้ service role key เพื่อข้าม RLS
// ใช้ได้เฉพาะฝั่ง Back และทุก route ที่ใช้ต้องผ่าน verifyToken + allow() แล้ว
export const adminDb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);
