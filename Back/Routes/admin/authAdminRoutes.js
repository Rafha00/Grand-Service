// Auth Service: /api/admin/users (Admin เท่านั้น) + /internal/auth
import express from 'express';
import { verifyToken } from '../../Middlewares/authMiddleware.js';
import { adminOnly, audit } from '../../Middlewares/adminAccess.js';
import { internalOnly } from '../../Services/internal.js';
import {
  getAllUsers, getUserById, updateUserRole, updateUser, deleteUser,
  internalGetUser, internalLookupUsers, internalStats,
} from '../../Controllers/admin/authAdmin.js';

const router = express.Router();
router.use('/users', verifyToken, adminOnly);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', audit('users', 'ROLE'), updateUserRole);
router.put('/users/:id', audit('users', 'UPDATE'), updateUser);
router.delete('/users/:id', audit('users', 'DELETE'), deleteUser);

export const internal = express.Router();
internal.use(internalOnly);
internal.get('/stats', internalStats);
internal.post('/users/lookup', internalLookupUsers);
internal.get('/users/:id', internalGetUser);

export default router;
