const express = require('express');

const customerController = require('../controllers/customerController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/customer-stats-credit')
    .get(authController.protect, customerController.getCustomerStatsForCredit);  

router
    .route('/customer-stats')
    .get(authController.protect, customerController.getCustomerStats);    

router
    .route('/')
    .get(authController.protect, customerController.getAllCustomers)
    .post(authController.protect, customerController.createCustomer)

router
    .route('/:id')
    .delete(authController.protect, customerController.deleteCustomerById)
    .patch(authController.protect, customerController.updateCustomerById);



module.exports = router;