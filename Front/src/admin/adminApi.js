import axiosClient from '../api/axiosClient';

// API ส่วนแอดมิน: เขียน/ลบ ผ่าน /api/admin (ล็อกด้วย requireAdmin), อ่านใช้ endpoint เดิมของทีม
const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

function body(res) { return res.data; }
function get(url) { return axiosClient.get(url).then(body); }
function put(url, data) { return axiosClient.put(url, data).then(body); }

// สร้างชุด list / create / update / remove ให้แต่ละตาราง
function crud(listUrl, path, config) {
  return {
    list: function () { return get(listUrl); },
    create: function (data) { return axiosClient.post(path, data, config).then(body); },
    update: function (id, data) { return axiosClient.put(`${path}/${id}`, data, config).then(body); },
    remove: function (id) { return axiosClient.delete(`${path}/${id}`).then(body); },
  };
}

export function getStats() { return get('/admin/stats'); }
export function getAuditLogs() { return get('/admin/audit-logs'); }

export const userApi = {
  ...crud('/admin/users', '/admin/users'),
  setRole: function (id, role) { return put(`/admin/users/${id}/role`, { role }); },
};

export const bookingApi = {
  ...crud('/admin/bookings', '/admin/bookings'),
  create: function (data) { return axiosClient.post('/admin/bookings', data).then(body); },
  setStatus: function (id, status) { return put(`/admin/bookings/${id}/status`, { status }); },
};

// สร้างสินค้าส่งรูปด้วย (multipart) แต่แก้ไขส่งเป็น JSON
export const productApi = {
  ...crud('/products', '/admin/products'),
  create: function (data) { return axiosClient.post('/admin/products', data, multipart).then(body); },
  // images = [{ file }] หรือ [{ url }] ผสมกันได้
  addImages: function (id, images) {
    const fd = new FormData();
    images.forEach(function (img) { if (img.file) fd.append('images', img.file); });
    fd.append('image_urls', JSON.stringify(images.filter(function (img) { return !img.file; }).map(function (img) { return img.url; })));
    return axiosClient.post(`/admin/products/${id}/images`, fd, multipart).then(body);
  },
};

// GET /brands เดิมคืนค่าเป็น { success, data }
export const brandApi = {
  ...crud('/brands', '/admin/brands', multipart),
  list: function () { return get('/brands').then(function (res) { return res.data || []; }); },
};

export const categoryApi = crud('/categories', '/admin/categories');
export const inventoryApi = crud('/inventory', '/admin/inventory');

export function errorMessage(err) {
  const data = err && err.response && err.response.data;
  return (data && (data.message || data.error)) || (err && err.message) || 'เกิดข้อผิดพลาด';
}
