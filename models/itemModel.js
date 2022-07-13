const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item must have a name'],
        trim: true,
        minlength: [2, 'Name must have minimum of 2 characters'],
        maxlength: [40, 'Name can have maximum of 40 characters']
    },
    mrp: {
        type: Number,
        required: [true, 'Item must have a mrp'],
        min: [1, 'Mobile Number must be greater than equal 1'],
        validate: {
            validator: function(val) {
                return val >= this.rate && val >= this.purchasePrice; 
            },
            message: 'mrp >= rate && mrp >= purchasePrice'
        }
    },
    rate: {
        type: Number,
        required: [true, 'Item must have a rate'],
        min: [1, 'Mobile Number must be greater than equal 1'],
        validate: {
            validator: function(val) {
                return val <= this.mrp && val >= this.purchasePrice;
            },
            message: 'rate <= mrp && rate >= purchasePrice'
        }
    },
    category: {
        type: String,
        required: [true, 'Item must have a category'],
        trim: true
    },
    size: {
        type: String,
        required: [true, 'Item must have a size'],
        trim: true,
        minlength: [2, 'size must have minimum of 2 characters'],
        maxlength: [40, 'size can have maximum of 40 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Item must have a quantity']
    },
    expiryDate: {
        type: Date,
        trim: true,
        // validate: {
        //     validator: function(val) {
        //         return val > this.manufacturingDate;
        //     },
        //     message: 'expiryDate must be > this.manufacturingDate'
        // }
        
    },
    manufacturingDate: {
        type: Date,
        trim: true,
        // validate: {
        //     validator: function(val) {
        //         return val < this.expiryDate;
        //     },
        //     message: 'manufacturingDate must be < this.expiryDate'
        // }
    },
    purchasePrice: {
        type: Number,
        required: [true, 'Item must have a purchasePrice'],
        min: [1, 'purchase price must be greater than equal 1'],
        validate: {
            validator: function(val) {
                return val <= this.mrp && val <= this.mrp;
            },
            message: 'purchasePrice must be <= mrp && purchasePrice must be <= mrp'
        }
    },
    brand: {
        type: String,
        trim: true,
        minlength: [2, 'brand must have minimum of 2 characters'],
        maxlength: [40, 'brand can have maximum of 40 characters']
    },
    adminIdFk: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

itemSchema.virtual('profit').get(function() {
    return this.rate - this.purchasePrice;
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;