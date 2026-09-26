import express from 'express'
import { getBrands } from '../Controllers/brandsController.js'

const router = express.Router();

router.get('/', getBrands )

// router.post()

// router.put('/:id')

// router.delete('/:id')




export default router;