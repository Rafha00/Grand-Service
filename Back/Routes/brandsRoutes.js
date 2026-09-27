import express from 'express'
import { getBrands , CreateBrands ,UpdateBrands, DeleteBrands } from '../Controllers/brandsController.js'

const router = express.Router();

router.get('/', getBrands )

router.post('/', CreateBrands)

router.put('/:id', UpdateBrands)

router.delete('/:id', DeleteBrands)




export default router;