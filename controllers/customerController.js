const Customer = require('../models/customerModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.createCustomer = catchAsync(async(req, res, next) => {

    const { mobileNumber, adminIdFk } = req.body;

    const availCustomer = await Customer.find({mobileNumber});
    if(availCustomer.length){
        for(let i=0; i<availCustomer.length; i += 1)  {
            if(availCustomer[i].adminIdFk === adminIdFk){
                return next(new AppError('Customer Already Exists', 400));
            }
        }
    }
    
    const customer = await Customer.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {customer}
    });
});

exports.getAllCustomers = catchAsync(async(req, res, next) => {

    const features = new APIFeatures(Customer.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const customers = await features.query;
    res.status(200).json({
        status: 'success',
        results: customers.length,
        data: customers
    });   
});

exports.getCustomerStatsForCredit = catchAsync(async(req, res, next) => {
    const {adminIdFk} = req.params;
    const stats = await Customer.aggregate([
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $match: { credit: { $gt: 0 } }
        },
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                totalCredit: { $sum: '$credit' }
            }
        },
        {
            $project: {
                _id: 0
            }
        },
    ]);

    if(!stats.length){
        return res.status(200).json({
            status: 'success',
            data: { 
                stats: [{
                totalCustomers: 0,
                totalCredit: 0
            }]
            }
        });
    }
    return res.status(200).json({
        status: 'success',
        data: {stats}
    });
    
});

exports.getCustomerStats = catchAsync(async(req, res, next) => {
    const {adminIdFk} = req.params;
    const stats = await Customer.aggregate([
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                totalCredit: { $sum: '$credit' }
            }
        },
        {
            $project: {
                _id: 0
            }
        },
    ]);

    if(!stats.length){
        return res.status(200).json({
            status: 'success',
            data: { 
                stats: [{
                totalCustomers: 0,
                totalCredit: 0
            }]
            }
        });
    }
    return res.status(200).json({
        status: 'success',
        data: {stats}
    });
    

});

exports.deleteCustomerById = catchAsync(async (req, res, next) => {


    const customer = await Customer.findByIdAndDelete(req.params.id);

    if(!customer){
        return next(new AppError('Cannot find item with this id', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.updateCustomerById = catchAsync(async (req, res, next) => {


    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!updatedCustomer){
        return next(new AppError('Cannot find customer with this id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {updatedCustomer}
    });
    
});
