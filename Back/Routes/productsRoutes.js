import express from 'express'
import {getProducts , getProductsById, CreateProducts , UpdateProducts , DeleteProducts} from '../Controllers/productsController.js'

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(CreateProducts);

router.get('/:id', getProductsById);

router.put('/:id', UpdateProducts);
router.delete('/:id' , DeleteProducts);






export default router;