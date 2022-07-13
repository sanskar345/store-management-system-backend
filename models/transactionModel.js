const mongoose = require('mongoose');
const validator = require('validator');


const transactionSchema = new mongoose.Schema({
    partyName: {
        type: String,
        required: [true, 'Transaction must have a partyName'],
        trim: true,
        minlength: [2, 'partyName must have minimum of 2 characters'],
        maxlength: [40, 'partyName can have maximum of 40 characters']
    },
    description: {
        type: String,
        // required: [true, 'Transaction must have a description'],
        trim: true
    },
    profit: {
        type: Number,
        required: [true, 'Store must have a profit'],
        validate: {
            validator: function(val) {
                return val <= this.totalAmount;
            },
            message: 'profit must be <= totalAmount'
        }
    },
    status: {
        type: String,
        required: [true, 'Transaction must have a status'],
        trim: true,
        enum: {
            values: ['PAID', 'CREDIT', 'COMPLETE'],
            message: 'Status can be PAID, CREDIT or COMPLETE'
        }
    },
    totalCustomerCredit: {
        type: Number,
        required: [true, 'Store must have a totalCustomerCredit'],
    },
    creditAmount: {
        type: Number,
        required: [true, 'Store must have a creditAmount'],
        validate: {
            validator: function(val) {
                return val <= this.totalAmount;
            },
            message: 'creditAmount must be <= totalAmount'
        }
    },
    invoiceOrBillNumber: {
        type: String,
        required: [true, 'Store must have a invoiceOrBillNumber'],
        unique: true
    },
    transactionNumber: {
        type: String,
        required: [true, 'Store must have a treansactionNumber'],
        unique: true
    },
    paymentOut: {
        type: Number,
        validate: {
            validator: function(val) {
                return val <= this.totalAmount;
            },
            message: 'paymentOut must be <= totalAmount'
        }
    },
    paymentIn: {
        type: Number,
        validate: {
            validator: function(val) {
                return val <= this.totalAmount;
            },
            message: 'paymentIn must be <= totalAmount'
        }
    },
    transactionType: {
        type: String,
        required: [true, 'Transaction must have a transactionType'],
        trim: true,
        enum: {
            values: ['SALE', 'PAYMENTIN', 'PAYMENTOUT'],
            message: 'Transaction Type can be SALE, PAYMENTIN or PAYMENTOUT'
        }
    },
    customerId: {
        type: String,
        trim: true,
    },
    totalAmount: {
        type: Number,
        required: [true, 'Store must have a totalAmount'],
        validate: {
            validator: function(val) {
                return val >= this.profit;
            },
            message: 'totalAmount must be >= this.profit'
        }
    },
    paymentMode: {
        type: String,
        trim: true,
        enum: {
            values: ['ONLINE', 'OFFLINE'],
            message: 'Payment Mode can be ONLINE or OFFLINE',
        }
    },
    items: [{}],
    partyMobileNumber: {
        type: String,
        required: [true, 'Store must have a partyMobileNumber'],
        validate: [validator.isMobilePhone, 'Party Mobile Number should be a mobile phone number']
    },
    dateTime: {
        type: Date,
        required: [true, 'Store must have a dateTime'],
    },
    date: {
        type: String,
        default: ((new Date()).toISOString()).split('T')[0]
    },
    adminIdFk: {
        type: String,
        required: [true, 'Transaction must have a adminIdFk'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;