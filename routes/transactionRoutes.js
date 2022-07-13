const express = require('express');

const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', itemController.checkId);
router
.route('/transactions-stats')
.get(authController.protect, transactionController.getTransactionsStats)

router
.route('/get-total-sales-today')
.get(authController.protect, transactionController.getTotalSalesToday)

// router
//   .route('/customerId/:id')
//   .get(authController.protect, transactionController.fiterByCustomerId, transactionController.getAllTransactions)

router 
  .route('/transactions-stats/:year')
  .get(authController.protect, transactionController.getTransactionsStatsByYear)
  
router
  .route('/:id')
  .get(authController.protect, transactionController.getTransactionsById)
  .patch(authController.protect, transactionController.updateTransactionsById)
  
router
  .route('/')
  .get(authController.protect, transactionController.getAllTransactions)
  .post(authController.protect, transactionController.createTransaction)



module.exports = router;
