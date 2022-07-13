const express = require('express');

const itemController = require('../controllers/itemControllers');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param('id', itemController.checkId);

router
  .route('/item-stats')
  .get(authController.protect, itemController.getItemsStats)

router
  .route('/item-out-of-stock')
  .get(authController.protect, itemController.getItemsOutOfStock)

router
  .route('/')
  .get(authController.protect, itemController.getAllItems)
  .post(authController.protect ,itemController.createItem);

router
  .route('/:id')
  .get(authController.protect  , itemController.getItemById)
  .patch(authController.protect , itemController.updateItemById)
  .delete(authController.protect , itemController.deleteItemById);

module.exports = router;
