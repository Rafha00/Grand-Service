import express from 'express'
import {getProducts , CreateProducts , UpdateProducts , DeleteProducts} from '../Controllers/productsController.js'

const router = express.Router();

router.get('/', getProducts)
router.post('/', CreateProducts)
router.put('/:id', UpdateProducts)
router.delete('/:id' , DeleteProducts)






export default router;