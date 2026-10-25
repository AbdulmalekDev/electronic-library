import DynamicList from '../models/DynamicList.js';

// @desc    Get all dynamic lists
// @route   GET /api/dynamic-lists
// @access  Public / Private
export const getLists = async (req, res, next) => {
    try {
        const lists = await DynamicList.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: lists
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single dynamic list by name
// @route   GET /api/dynamic-lists/:name
// @access  Public / Private
export const getListByName = async (req, res, next) => {
    try {
        const list = await DynamicList.findOne({ name: req.params.name });
        
        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'القائمة غير موجودة'
            });
        }
        
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a dynamic list
// @route   POST /api/dynamic-lists
// @access  Private (Admin)
export const createList = async (req, res, next) => {
    try {
        const { name, label, items } = req.body;
        
        // Check if exists
        const exists = await DynamicList.findOne({ name });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'يوجد قائمة بهذا الاسم بالفعل'
            });
        }
        
        const list = await DynamicList.create({ name, label, items });
        
        res.status(201).json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a dynamic list
// @route   PUT /api/dynamic-lists/:id
// @access  Private (Admin)
export const updateList = async (req, res, next) => {
    try {
        const list = await DynamicList.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'القائمة غير موجودة'
            });
        }
        
        res.status(200).json({
            success: true,
            data: list
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a dynamic list
// @route   DELETE /api/dynamic-lists/:id
// @access  Private (Admin)
export const deleteList = async (req, res, next) => {
    try {
        const list = await DynamicList.findByIdAndDelete(req.params.id);
        
        if (!list) {
            return res.status(404).json({
                success: false,
                message: 'القائمة غير موجودة'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'تم حذف القائمة بنجاح'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getLists,
    getListByName,
    createList,
    updateList,
    deleteList
};
