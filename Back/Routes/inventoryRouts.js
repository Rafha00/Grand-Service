import express from 'express';
import {
    getInventory,
    getAvailableStockMap,
    getInventoryByProductId,
    getStockSummaryByProductId,
    createInventory,
    updateInventory
} from '../Controllers/inventoryController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { staffOnly } from '../Middlewares/adminAccess.js';

const router = express.Router();

router.route('/')
    .get(getInventory)
    .post(verifyToken, staffOnly, createInventory);

router.get('/stock-map', getAvailableStockMap);
router.get('/product/:productId/summary', getStockSummaryByProductId);
router.get('/product/:productId', getInventoryByProductId);
router.patch('/:id', verifyToken, staffOnly, updateInventory);

export default router;