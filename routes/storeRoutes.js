const express = require('express');

const storeController = require('../controllers/storeController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(authController.protect ,storeController.getStore)
    .post(authController.protect ,storeController.createStore);

router
    .route('/:id')
    .patch(authController.protect, storeController.updateStoreById)


module.exports = router;