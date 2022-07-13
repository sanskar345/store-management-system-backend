const mongoose = require('mongoose');

const itemCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'itemCategory must have a name'],
        trim: true,
        minlength: [2, 'Name must have minimum of 2 characters'],
        maxlength: [40, 'Name can have maximum of 40 characters']
    },
    adminIdFk: {
        type: String,
        trim: true,
        required: [true, 'itemCategory must have a adminIdFk'],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const ItemCategory = mongoose.model('ItemCategory', itemCategorySchema);

module.exports = ItemCategory;
