import express from 'express'
import { getBrands , CreateBrands ,UpdateBrands, DeleteBrands } from '../Controllers/brandsController.js'
import upload from '../Middlewares/uploadMiddleware.js';


const router = express.Router();


router.route('/')
    .get(getBrands)
    .post(upload.single('logo_url'), CreateBrands);



router.put('/:id', UpdateBrands);

router.delete('/:id', DeleteBrands);




export default router;