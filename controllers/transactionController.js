const Transaction = require('../models/transactionModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.fiterByCustomerId = (req, res, next) => {
    req.query = {customerId: req.params.id};
    next();
};

exports.getAllTransactions = catchAsync(async (req, res, next) => {
    // Execute Query
    const features = new APIFeatures(Transaction.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const transactions = await features.query;

    res.status(200).json({
        status: 'success',
        results: transactions.length,
        data: transactions
    });

});

exports.createTransaction = catchAsync(async (req, res, next) => {

    const newTransaction = await Transaction.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            item: newTransaction
        }
    });

});

exports.getTransactionsById = catchAsync(async (req, res, next) => {

    const transaction = await Transaction.findById(req.params.id);

    if(!transaction){
       return next(new AppError('Cannot find transaction with this id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {transaction}
    })   

});

exports.updateTransactionsById = catchAsync(async (req, res, next) => {


    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        
    });

    if(!updatedTransaction){
        return next(new AppError('Cannot find transaction with this id', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {updatedTransaction}
    });
    
});

exports.getTransactionsStatsByYear = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const {adminIdFk} = req.params;
    const stats = await Transaction.aggregate([
        {
            $match: { dateTime: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } }
        },
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $match: { transactionType: 'SALE' }
        },
        {
            $group: {
                _id: { $month: '$dateTime' },
                totalSales: { $sum: 1 },
                totalProfit: { $sum: '$profit' },
                turnOver: { $sum: '$totalAmount' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                month: 1
            }
        }
    ]);

    if(!stats.length){
        return res.status(201).json({
            status: 'success',
            data: {
                stats: [{
                    totalSales: 0,
                    totalProfit: 0,
                    turnOver: 0
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

exports.getTransactionsStats = catchAsync(async (req, res, next) => {
    const {adminIdFk} = req.params;
    const stats = await Transaction.aggregate([
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalProfit: { $sum: '$profit' },
                turnOver: { $sum: '$totalAmount' }
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
                    totalTransactions: 0,
                    totalProfit: 0,
                    turnOver: 0
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


exports.getTotalSalesToday = catchAsync(async (req, res, next) => {
    const {adminIdFk} = req.params;
    const today = req.query.date;
    // console.log(req.query.date);
    const stats = await Transaction.aggregate([
        {
            $match: { date: today }
        },
        {
            $match: { adminIdFk: adminIdFk }
        },
        {
            $match: { transactionType: 'SALE' }
        },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalProfit: { $sum: '$profit' },
                turnOver: { $sum: '$totalAmount' }
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
                    totalTransactions: 0,
                    totalProfit: 0,
                    turnOver: 0
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