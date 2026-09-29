import express from 'express'
import {getProducts , getProductsById, CreateProducts , UpdateProducts , DeleteProducts} from '../Controllers/productsController.js'
import upload from '../Middlewares/uploadMiddleware.js';
const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(upload.array('images', 5), CreateProducts);

router.get('/:id', getProductsById);

router.put('/:id', UpdateProducts);
router.delete('/:id' , DeleteProducts);






export default router;