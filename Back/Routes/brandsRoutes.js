import express from 'express'
import { getBrands , CreateBrands ,UpdateBrands, DeleteBrands } from '../Controllers/brandsController.js'

const router = express.Router();

router.route('/')
    .get(getBrands)
    .post(CreateBrands);



router.put('/:id', UpdateBrands);

router.delete('/:id', DeleteBrands);




export default router;