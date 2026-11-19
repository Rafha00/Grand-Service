import express from 'express'

import {getCategories ,getCategoriesById , CreateCategories ,UpdateCategories, DeleteCategories, } from '../Controllers/categoriesController.js'
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { managerOnly } from '../Middlewares/adminAccess.js';


const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(verifyToken, managerOnly, CreateCategories);

router.get('/:id', getCategoriesById)

router.put('/:id', verifyToken, managerOnly, UpdateCategories);
router.delete('/:id', verifyToken, managerOnly, DeleteCategories);





export default router;