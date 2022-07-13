const ItemCategory = require('../models/itemCategoryModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllItemCategory = catchAsync(async(req, res) => {

    const features = new APIFeatures(ItemCategory.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const itemCategories = await features.query;

    res.status(200).json({
        status: 'success',
        results: itemCategories.length,
        data: itemCategories
    })
});

exports.createItemCategory = catchAsync(async(req, res, next) => {

    const { name, adminIdFk } = req.body;

    const availItemCategory = await ItemCategory.find({name});

    if(availItemCategory.length){
        for(let i=0; i<availItemCategory.length; i += 1)  {
            if(availItemCategory[i].adminIdFk === adminIdFk){
                return next(new AppError('ItemCategory Already Exists', 400));
            }
        }
    }
    

    const itemCategory = await ItemCategory.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {itemCategory}
    })
});