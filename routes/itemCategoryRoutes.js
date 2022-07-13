const express = require('express');

const itemCategoryController = require('../controllers/itemCategoryController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(authController.protect ,itemCategoryController.getAllItemCategory)
    .post(authController.protect ,itemCategoryController.createItemCategory)

module.exports = router;