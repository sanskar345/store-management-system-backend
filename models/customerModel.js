const mongoose = require('mongoose');
const validator = require('validator');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer must have a name'],
        trim: true,
        minlength: [4, 'Name must have minimum of 4 characters'],
        maxlength: [40, 'Name can have maximum of 40 characters']
    },
    mobileNumber: {
        type: String,
        required: [true, 'Customer must have a mobileNumber'],
        validate: [validator.isMobilePhone, 'Mobile Number should be a mobile phone number']
    },
    address: {
        type: String,
        required: [true, 'Customer must have a address'],
        trim: true,
        minlength: [4, 'Address must have minimum of 4 characters'],
    },
    credit: {
        type: Number,
        required: [true, 'Customer must have a credit'],
        min: [0, 'Credit must be greater than equal 0'],
    },
    billsWithCredit: [String],
    adhaarNumber: {
        type: String,
        trim: true
    },
    dob: {
        type: Date,
        required: [true, 'Customer must have a dob'],
    },
    adminIdFk: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;