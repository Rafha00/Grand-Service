// Catalog Service: สินค้า / รูปสินค้า (schema catalog)
import { catalogDb as supabase } from '../../Config/db.js';
import { callService } from '../../Services/internal.js';

const PRODUCT_BUCKET = 'product-images';
const TEXT_FIELDS = ['name', 'model', 'reference_number', 'condition', 'movement', 'case_size', 'case_material', 'warranty'];

// ดึงชื่อไฟล์ใน Storage จาก public URL (ถ้าเป็นลิงก์ภายนอกจะได้ null)
const storagePathFromUrl = (url) => {
  const marker = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;
  const index = (url || '').indexOf(marker);
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
};

export const adminCreateProduct = async (req, res) => {
  try {
    const b = req.body;
    const row = Object.fromEntries(TEXT_FIELDS.map((k) => [k, String(b[k] ?? '').trim() || null]));
    if (!row.name) return res.status(400).json({ message: 'กรุณาใส่ชื่อสินค้า' });
    if (!b.brand_id || !b.category_id) return res.status(400).json({ message: 'กรุณาเลือกแบรนด์และหมวดหมู่' });

    row.price = b.price === '' || b.price == null ? null : Number(b.price);
    row.year = b.year === '' || b.year == null ? null : Number(b.year);
    row.brand_id = b.brand_id;
    row.category_id = b.category_id;
    row.is_active = b.is_active === true || b.is_active === 'true';

    const { data, error } = await supabase.from('Products').insert(row).select('*').single();
    if (error) throw error;
    res.status(201).json({ message: 'เพิ่มสินค้าแล้ว', product: data, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// เพิ่มรูป ทั้งไฟล์ (images) และลิงก์ (image_urls เป็น JSON array หรือข้อความบรรทัดละลิงก์)
export const addProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    let urls = req.body.image_urls || [];
    if (typeof urls === 'string') {
      try { urls = JSON.parse(urls); } catch { urls = urls.split('\n'); }
    }
    urls = [].concat(urls).map((u) => String(u).trim()).filter(Boolean);
    const bad = urls.find((u) => !/^https?:\/\/\S+$/i.test(u));
    if (bad) return res.status(400).json({ message: `ลิงก์รูปไม่ถูกต้อง: ${bad}` });

    const files = req.files || [];
    if (urls.length + files.length === 0) return res.status(400).json({ message: 'ไม่มีรูปที่จะเพิ่ม' });

    const { count } = await supabase.from('Product_Images').select('*', { count: 'exact', head: true }).eq('product_id', id);
    let order = count || 0;

    for (const file of files) {
      const path = `${id}-${Date.now()}-${order}.${file.originalname.split('.').pop()}`;
      const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      urls.push(supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path).data.publicUrl);
    }

    const rows = urls.map((image_url) => ({ product_id: id, image_url, sort_order: order++ }));
    const { data, error } = await supabase.from('Product_Images').insert(rows).select();
    if (error) throw error;
    res.json({ message: `เพิ่มรูป ${data.length} รูปแล้ว`, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // สต็อกกับการจองอยู่คนละ service: ถามผ่าน API ก่อนลบ
    const [{ count: stockCount }, { count: bookingCount }] = await Promise.all([
      callService('inventory', `/internal/inventory/count?product_id=${encodeURIComponent(id)}`),
      callService('booking', `/internal/booking/count?inventory_id=${encodeURIComponent(id)}`),
    ]);
    if (stockCount > 0) {
      return res.status(400).json({ message: `สินค้านี้ยังมีในสต็อก ${stockCount} รายการ กรุณาลบรายการในหน้าสต็อกก่อน` });
    }
    if (bookingCount > 0) {
      return res.status(400).json({ message: `สินค้านี้ยังมีการจอง ${bookingCount} รายการ กรุณาลบการจองในหน้าการจองก่อน` });
    }

    const { data: images, error: imagesError } = await supabase.from('Product_Images').select('*').eq('product_id', id);
    if (imagesError) throw imagesError;

    // Product_Images ผูก foreign key แบบ cascade: ลบสินค้าแล้วรูปในตารางหายตาม
    const { data: deleted, error: productError } = await supabase.from('Products').delete().eq('id', id).select('id');
    if (productError) throw productError;
    if (!deleted.length) return res.status(404).json({ message: 'ไม่พบสินค้า' });

    // ลบไฟล์รูปใน Storage (เฉพาะรูปที่อัปโหลดผ่านระบบ)
    const paths = images.map((img) => storagePathFromUrl(img.image_url)).filter(Boolean);
    if (paths.length) await supabase.storage.from(PRODUCT_BUCKET).remove(paths);

    return res.status(200).json({ message: 'ลบสินค้าเรียบร้อย' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------- internal API ----------
// จำนวนสินค้า (ทั้งหมด / แสดงหน้าร้าน) + จำนวนแบรนด์ หมวดหมู่
export const internalStats = async (req, res) => {
  const count = (table) => supabase.from(table).select('*', { count: 'exact', head: true });
  const results = await Promise.all([
    count('Products'), count('Products').eq('is_active', true), count('brands'), count('Categories'),
  ]);
  const failed = results.find((r) => r.error);
  if (failed) return res.status(500).json({ message: failed.error.message });

  const [products, active, brands, categories] = results.map((r) => r.count ?? 0);
  res.json({ products, activeProducts: active, brands, categories });
};
