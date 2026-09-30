import express from 'express'
import { getBrands , CreateBrands ,UpdateBrands, DeleteBrands } from '../Controllers/brandsController.js'
import upload from '../Middlewares/uploadMiddlewar.js';
import multer from 'multer';

const router = express.Router();

const upload = multer();

router.route('/')
    .get(getBrands)
    router.post('/brands', upload.single('logo_url'), CreateBrands);



router.put('/:id', UpdateBrands);

router.delete('/:id', DeleteBrands);




export default router;