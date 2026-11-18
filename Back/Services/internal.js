// การสื่อสารระหว่าง Service (service-to-service REST)
// แต่ละ service ไม่อ่าน database ของ service อื่นตรงๆ แต่เรียกผ่าน API แทน
// ใน Docker ตั้ง AUTH_URL, CATALOG_URL ... ให้ชี้ไปที่ container ของแต่ละ service
// ตอนรัน server.js ตัวเดียว (npm start) ทุก service อยู่ใน process เดียวกัน จึงเรียกที่ตัวเอง

const SERVICE_URL = {
  auth: 'AUTH_URL',
  catalog: 'CATALOG_URL',
  inventory: 'INVENTORY_URL',
  booking: 'BOOKING_URL',
  admin: 'ADMIN_URL',
};

const token = () => process.env.INTERNAL_TOKEN || 'grand-service-internal';
const baseUrl = (service) => process.env[SERVICE_URL[service]] || `http://127.0.0.1:${process.env.PORT || 5000}`;

export const callService = async (service, path, { method = 'GET', body } = {}) => {
  const res = await fetch(baseUrl(service) + path, {
    method,
    headers: { 'content-type': 'application/json', 'x-internal-token': token() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && (data.message || data.error)) || `${service} service ตอบกลับ ${res.status}`);
  return data;
};

// route /internal/* เรียกได้เฉพาะ service ด้วยกัน (Gateway ไม่ส่ง /internal ออกไปข้างนอก)
export const internalOnly = (req, res, next) =>
  req.get('x-internal-token') === token() ? next() : res.status(403).json({ message: 'internal only' });
