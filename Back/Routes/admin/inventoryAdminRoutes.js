// Inventory Service: /api/admin/inventory + /internal/inventory
import express from 'express';
import { verifyToken } from '../../Middlewares/authMiddleware.js';
import { staffOnly, managerOnly, audit } from '../../Middlewares/adminAccess.js';
import { internalOnly } from '../../Services/internal.js';
import { createInventory, updateInventory } from '../../Controllers/inventoryController.js';
import { deleteInventory, internalStats, internalCount } from '../../Controllers/admin/inventoryAdmin.js';

const router = express.Router();
router.use('/inventory', verifyToken, staffOnly);
router.post('/inventory', audit('inventory', 'CREATE'), createInventory);
router.put('/inventory/:id', audit('inventory', 'UPDATE'), updateInventory);
router.delete('/inventory/:id', managerOnly, audit('inventory', 'DELETE'), deleteInventory);

export const internal = express.Router();
internal.use(internalOnly);
internal.get('/stats', internalStats);
internal.get('/count', internalCount);

export default router;
