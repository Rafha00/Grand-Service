// Catalog Service: /api/admin/products, /brands, /categories (Admin / Manager) + /internal/catalog
import express from 'express';
import upload from '../../Middlewares/uploadMiddleware.js';
import { verifyToken } from '../../Middlewares/authMiddleware.js';
import { managerOnly, audit } from '../../Middlewares/adminAccess.js';
import { internalOnly } from '../../Services/internal.js';
import { UpdateProducts } from '../../Controllers/productsController.js';
import { CreateBrands, UpdateBrands, DeleteBrands } from '../../Controllers/brandsController.js';
import { CreateCategories, UpdateCategories, DeleteCategories } from '../../Controllers/categoriesController.js';
import { adminCreateProduct, addProductImages, deleteProduct, internalStats } from '../../Controllers/admin/catalogAdmin.js';

// ราคา/ปี ต้องไม่ติดลบ
const checkPrice = (req, res, next) => {
  const bad = ['price', 'year'].find((k) => req.body[k] !== undefined && req.body[k] !== '' && !(Number(req.body[k]) >= 0));
  return bad ? res.status(400).json({ message: `${bad === 'price' ? 'ราคา' : 'ปี'}ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป` }) : next();
};

const router = express.Router();
router.use(['/products', '/brands', '/categories'], verifyToken, managerOnly);

router.post('/products', upload.none(), checkPrice, audit('products', 'CREATE'), adminCreateProduct);
router.put('/products/:id', checkPrice, audit('products', 'UPDATE'), UpdateProducts);
router.delete('/products/:id', audit('products', 'DELETE'), deleteProduct);
router.post('/products/:id/images', upload.array('images', 5), audit('products', 'IMAGES'), addProductImages);

router.post('/brands', upload.single('logo_url'), audit('brands', 'CREATE'), CreateBrands);
router.put('/brands/:id', upload.single('logo_url'), audit('brands', 'UPDATE'), UpdateBrands);
router.delete('/brands/:id', audit('brands', 'DELETE'), DeleteBrands);

router.post('/categories', audit('categories', 'CREATE'), CreateCategories);
router.put('/categories/:id', audit('categories', 'UPDATE'), UpdateCategories);
router.delete('/categories/:id', audit('categories', 'DELETE'), DeleteCategories);

export const internal = express.Router();
internal.use(internalOnly);
internal.get('/stats', internalStats);

export default router;
