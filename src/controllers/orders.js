const orderModel = require('../models/order');
const productModel = require('../models/product');

async function getOrders(req, res) {
  try {
    const { role } = req.query;
    const orders = await orderModel.findAll(req.user.id, role);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await orderModel.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createOrder(req, res) {
  try {
    const { productId, quantity } = req.body;
    
    const product = await productModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.available) {
      return res.status(400).json({ message: 'Product is not available' });
    }
    
    if (product.sellerId === req.user.id) {
      return res.status(400).json({ message: 'Cannot order your own product' });
    }
    
    const orderData = {
      productId: product.id,
      productTitle: product.title,
      buyerId: req.user.id,
      buyerName: req.user.name,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      quantity,
      unitPrice: product.price,
    };
    
    const order = await orderModel.create(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await orderModel.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updated = await orderModel.update(req.params.id, { status });
    res.json(updated);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};