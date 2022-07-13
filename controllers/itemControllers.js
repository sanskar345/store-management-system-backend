const Item = require('../models/itemModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllItems = catchAsync(async (req, res, next) => {

    const features = new APIFeatures(Item.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const items = await features.query;

    res.status(200).json({
        status: 'success',
        results: items.length,
        data: items
    });

});

exports.getItemById = catchAsync(async (req, res, next) => {

    const item = await Item.findById(req.params.id);

    if(!item){
       return next(new AppError('Cannot find item with this id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {item}
    })   

});

exports.createItem = catchAsync(async (req, res, next) => {

    const { name, adminIdFk } = req.body;

    const availItem = await Item.find({name});
    if(availItem.length){
        for(let i=0; i<availItem.length; i += 1)  {
            if(availItem[i].adminIdFk === adminIdFk){
                return next(new AppError('Item Already Exists', 400));
            }
        }
    }

    const newItem = await Item.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            item: newItem
        }
    });
});

exports.updateItemById = catchAsync(async (req, res, next) => {


    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    if(!updatedItem){
        return next(new AppError('Cannot find item with this id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {updatedItem}
    });
    
});

exports.deleteItemById = catchAsync(async (req, res, next) => {


    const item = await Item.findByIdAndDelete(req.params.id);

    if(!item){
        return next(new AppError('Cannot find item with this id', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.getItemsStats = catchAsync(async (req, res, next) => {
    const {adminIdFk} = req.params;
    const stats = await Item.aggregate([
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $group: {
                _id: null,
                totalItems: { $sum: 1 },
                totalStockQuantity: { $sum: '$quantity' },
            }
        },
        {
            $project: {
                _id: 0
            }
        },
    ]);

    if(!stats.length){
        return res.status(201).json({
            status: 'success',
            data: {
                stats: [{
                    totalItems: 0,
                    totalStockQuantity: 0,
                }]
            }
        });
    }
    return res.status(201).json({
        status: 'success',
        data: {
            stats: stats
        }
    });
    

});

exports.getItemsOutOfStock = catchAsync(async (req, res, next) => {
    const {adminIdFk} = req.params;
    const stats = await Item.aggregate([
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $match: { quantity: { $lt: 1 } }
        },
        {
            $group: {
                _id: null,
                itemsOutOfStock: { $sum: 1 },
            }
        },
        {
            $project: {
                _id: 0
            }
        },
    ]);

    if(!stats.length){
        return res.status(201).json({
            status: 'success',
            data: {
                stats: [{
                    itemsOutOfStock: 0,
                }]
            }
        });  
    }
    return res.status(201).json({
        status: 'success',
        data: {
            stats: stats
        }
    });
    

});
