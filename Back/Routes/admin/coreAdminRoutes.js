// Admin Service: /api/admin/stats, /api/admin/audit-logs + /internal/admin
import express from 'express';
import { verifyToken } from '../../Middlewares/authMiddleware.js';
import { staffOnly, managerOnly } from '../../Middlewares/adminAccess.js';
import { internalOnly } from '../../Services/internal.js';
import { getStats, getAuditLogs, internalWriteAudit } from '../../Controllers/admin/coreAdmin.js';

const router = express.Router();
router.get('/stats', verifyToken, staffOnly, getStats);
router.get('/audit-logs', verifyToken, managerOnly, getAuditLogs);

export const internal = express.Router();
internal.use(internalOnly);
internal.post('/audit', internalWriteAudit);

export default router;
