const mongoose = require('mongoose');
const validator = require('validator');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Store must have a name'],
        trim: true,
        minlength: [4, 'Name must have minimum of 4 characters'],
        maxlength: [40, 'Name can have maximum of 40 characters']
    },
    storeContactNumber: {
        type: String,
        required: [true, 'Store must have a storeContactNumber'],
        validate: [validator.isMobilePhone, 'Store Contact Number should be a mobile phone number']
    },
    adminIdFk: {
        type: String,
        unique: true,
        required: [true, 'Store must have a adminIdFk'],
        trim: true

    },
    // ownerName: {
    //     type: String,
    //     // required: [true, 'Store must have a ownerName'],
    //     trim: true,
    //     minlength: [4, 'Name must have minimum of 4 characters'],
    //     maxlength: [40, 'Name can have maximum of 40 characters']
    // },
    // storeContactNumber: {
    //     type: String,
    //     // required: [true, 'Store must have a storeContactNumber'],
    //     validate: [validator.isMobilePhone, 'Store Contact Number should be a mobile phone number']
    // },
    // ownerContactNumber: {
    //     type: String,
    //     // required: [true, 'Store must have a ownerContactNumber'],
    //     validate: [validator.isMobilePhone, 'Owner Contact Number should be a mobile phone number']
    // },
    // email: {
    //     type: String,
    //     // required: [true, 'Store must have a email'],
    //     trim: true,
    //     minlength: [4, 'email must have minimum of 4 characters'],
    //     maxlength: [50, 'email can have maximum of 40 characters'],
    //     validate: [validator.isEmail, 'email must be a in email format']
    // },
    // storeDP: {
    //     type: String,
    //     trim: true
    // },
    // websiteUrl: {
    //     type: String,
    //     trim: true,
    //     // required: [true, 'Store must have a websiteUrl'],
    //     minlength: [6, 'websiteUrl must have minimum of 4 characters'],
    //     maxlength: [40, 'websiteUrl can have maximum of 40 characters'],
    //     validate: [validator.isDataURI, 'website url must be a DataURI']
    // },
    // signature: {
    //     type: String,
    //     trim: true
    // },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;