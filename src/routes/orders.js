const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/', authenticate, orderController.createOrder);
router.patch('/:id', authenticate, orderController.updateOrderStatus);

module.exports = router;
