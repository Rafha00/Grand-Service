import experss from 'express'
import {getInventory , getInventoryByProductId, createInventory } from '../Controllers/inventoryController.js'
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { staffOnly } from '../Middlewares/adminAccess.js';

const router = experss.Router();

router.route('/')
.get(getInventory)
.post(verifyToken, staffOnly, createInventory)

router.get('/product/:productId', getInventoryByProductId);



export default router;

