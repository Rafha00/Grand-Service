import experss from 'express'
import {getInventory , getInventoryByProductId, createInventory } from '../Controllers/inventoryController.js'

const router = experss.Router();

router.route('/')
.get(getInventory)
.post(createInventory)

router.get('/product/:productId', getInventoryByProductId);



export default router;

