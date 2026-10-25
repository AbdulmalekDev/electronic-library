import express from 'express';
import {
    getLists,
    getListByName,
    createList,
    updateList,
    deleteList
} from '../controllers/dynamicListController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getLists)
    .post(protect, authorize('admin'), createList);

router.route('/:name')
    .get(getListByName);

router.route('/id/:id')
    .put(protect, authorize('admin'), updateList)
    .delete(protect, authorize('admin'), deleteList);

export default router;
