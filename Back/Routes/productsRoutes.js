import express from 'express'
import {getProducts , getProductsById, CreateProducts , UpdateProducts , DeleteProducts} from '../Controllers/productsController.js'
import upload from '../Middlewares/uploadMiddleware.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { managerOnly } from '../Middlewares/adminAccess.js';
const router = express.Router();


router.route('/')
    .get(getProducts)
    .post(verifyToken, managerOnly, upload.array('images', 5), CreateProducts);

router.get('/:id', getProductsById);

router.put('/:id', verifyToken, managerOnly, UpdateProducts);
router.delete('/:id', verifyToken, managerOnly, DeleteProducts);






export default router;