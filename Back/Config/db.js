import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Database ต่อ Service: แต่ละ service ต่อเฉพาะ schema ของตัวเอง
// ใช้ service role key (ฝั่ง server เท่านั้น) ส่วน anon key เข้า schema เหล่านี้ไม่ได้
const connect = (schema) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    db: { schema },
  });

export const authDb = connect('auth_svc');      // Profiles
export const catalogDb = connect('catalog');    // Products, Product_Images, brands, Categories
export const inventoryDb = connect('inventory'); // Inventory
export const bookingDb = connect('booking');    // bookings, locations, Notifications
export const adminDb = connect('admin');        // Audit_logs
