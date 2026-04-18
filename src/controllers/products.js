const productModel = require('../models/product');

async function getProducts(req, res) {
  try {
    const { category, location, listingType, sellerId } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (listingType) filters.listingType = listingType;
    if (sellerId) filters.sellerId = sellerId;
    
    const products = await productModel.findAll(filters);
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getProductById(req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function searchProducts(req, res) {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }
    
    const products = await productModel.search(q);
    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function createProduct(req, res) {
  try {
    const productData = {
      ...req.body,
      sellerId: req.user.id,
      sellerName: req.user.name,
    };
    
    const product = await productModel.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    const updated = await productModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await productModel.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await productModel.remove(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};