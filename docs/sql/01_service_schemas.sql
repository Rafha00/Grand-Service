-- ============================================================
-- Grand Service: แยก Database ต่อ Service (schema-per-service)
-- รันใน Supabase → SQL Editor ได้ครั้งเดียวจบ
-- คัดลอกตารางจาก public ไปไว้ใน schema ของแต่ละ service
-- ตารางเดิมใน public ไม่ถูกแก้หรือลบ (เว็บเดิมยังใช้ได้ระหว่างย้าย)
-- ============================================================

begin;

-- 1) สร้าง schema ของแต่ละ service
create schema if not exists auth_svc;
create schema if not exists catalog;
create schema if not exists inventory;
create schema if not exists booking;
create schema if not exists admin;

-- 2) คัดลอกโครงสร้าง (คอลัมน์, ค่าเริ่มต้น, primary key, index) แล้วคัดลอกข้อมูล
--    Auth Service
create table if not exists auth_svc."Profiles"        (like public."Profiles"        including all);
insert into auth_svc."Profiles"        select * from public."Profiles"        on conflict do nothing;

--    Catalog Service
create table if not exists catalog.brands             (like public.brands             including all);
create table if not exists catalog."Categories"       (like public."Categories"       including all);
create table if not exists catalog."Products"         (like public."Products"         including all);
create table if not exists catalog."Product_Images"   (like public."Product_Images"   including all);
insert into catalog.brands           select * from public.brands           on conflict do nothing;
insert into catalog."Categories"     select * from public."Categories"     on conflict do nothing;
insert into catalog."Products"       select * from public."Products"       on conflict do nothing;
insert into catalog."Product_Images" select * from public."Product_Images" on conflict do nothing;

--    Inventory Service
create table if not exists inventory."Inventory"      (like public."Inventory"        including all);
insert into inventory."Inventory"    select * from public."Inventory"      on conflict do nothing;

--    Booking Service
create table if not exists booking.bookings           (like public.bookings           including all);
create table if not exists booking.locations          (like public.locations          including all);
create table if not exists booking."Notifications"    (like public."Notifications"    including all);
insert into booking.bookings         select * from public.bookings         on conflict do nothing;
insert into booking.locations        select * from public.locations        on conflict do nothing;
insert into booking."Notifications"  select * from public."Notifications"  on conflict do nothing;

--    Admin Service
create table if not exists admin."Audit_logs"         (like public."Audit_logs"       including all);
insert into admin."Audit_logs"       select * from public."Audit_logs"     on conflict do nothing;

-- 3) Foreign key เฉพาะภายใน service เดียวกัน
--    (ข้าม service ไม่ผูก FK: service คุยกันผ่าน API แทน)
alter table catalog."Products"
  add constraint products_brand_fk    foreign key (brand_id)    references catalog.brands(id)       on delete set null,
  add constraint products_category_fk foreign key (category_id) references catalog."Categories"(id) on delete set null;
alter table catalog."Product_Images"
  add constraint product_images_product_fk foreign key (product_id) references catalog."Products"(id) on delete cascade;

-- 4) สิทธิ์: ให้เฉพาะ service_role (ใช้ฝั่ง server เท่านั้น)
--    anon / authenticated (key ที่อยู่ในหน้าเว็บได้) เข้า schema เหล่านี้ไม่ได้
do $$
declare s text;
begin
  foreach s in array array['auth_svc', 'catalog', 'inventory', 'booking', 'admin'] loop
    execute format('revoke all on schema %I from anon, authenticated', s);
    execute format('grant usage on schema %I to service_role', s);
    execute format('grant all on all tables in schema %I to service_role', s);
    execute format('grant all on all sequences in schema %I to service_role', s);
    execute format('alter default privileges in schema %I grant all on tables to service_role', s);
  end loop;
end $$;

commit;

-- 5) ตรวจผล: ควรเห็นจำนวนแถวเท่ากับตารางเดิม
select 'auth_svc.Profiles'         as "table", count(*) from auth_svc."Profiles"
union all select 'catalog.brands',            count(*) from catalog.brands
union all select 'catalog.Categories',        count(*) from catalog."Categories"
union all select 'catalog.Products',          count(*) from catalog."Products"
union all select 'catalog.Product_Images',    count(*) from catalog."Product_Images"
union all select 'inventory.Inventory',       count(*) from inventory."Inventory"
union all select 'booking.bookings',          count(*) from booking.bookings
union all select 'booking.locations',         count(*) from booking.locations
union all select 'booking.Notifications',     count(*) from booking."Notifications"
union all select 'admin.Audit_logs',          count(*) from admin."Audit_logs";
