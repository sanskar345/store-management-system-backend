const Store = require('../models/storeModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');


exports.getStore = catchAsync(async(req, res) => {

    const features = new APIFeatures(Store.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const store = await features.query;

    res.status(200).json({
        status: 'success',
        results: store.length,
        data: store
    })
});

exports.createStore = catchAsync(async(req, res, next) => {
    const store = await Store.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {store}
    })
});

exports.updateStoreById = catchAsync(async (req, res, next) => {


    const updatedStore = await Store.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    if(!updatedStore){
        return next(new AppError('Cannot find item with this id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {updatedStore}
    });
    
});