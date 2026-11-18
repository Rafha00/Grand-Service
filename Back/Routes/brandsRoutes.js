import express from 'express'
import { getBrands , CreateBrands ,UpdateBrands, DeleteBrands } from '../Controllers/brandsController.js'
import upload from '../Middlewares/uploadMiddleware.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { managerOnly } from '../Middlewares/adminAccess.js';


const router = express.Router();


router.route('/')
    .get(getBrands)
    .post(verifyToken, managerOnly, upload.single('logo_url'), CreateBrands);



router.put('/:id', verifyToken, managerOnly, UpdateBrands);

router.delete('/:id', verifyToken, managerOnly, DeleteBrands);




export default router;