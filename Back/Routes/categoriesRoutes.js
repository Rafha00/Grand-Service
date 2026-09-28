import express from 'express'

import {getCategories , CreateCategories ,UpdateCategories, DeleteCategories, } from '../Controllers/categoriesController.js'


const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(CreateCategories);

router.put('/:id', UpdateCategories);
router.delete('/:id', DeleteCategories);





export default router;