import express from 'express'

import {getCategories ,getCategoriesById , CreateCategories ,UpdateCategories, DeleteCategories, } from '../Controllers/categoriesController.js'


const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(CreateCategories);

router.get('/:id', getCategoriesById)

router.put('/:id', UpdateCategories);
router.delete('/:id', DeleteCategories);





export default router;