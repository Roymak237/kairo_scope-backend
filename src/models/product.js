const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

async function findAll(filters = {}) {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.location) {
    query += ' AND location LIKE ?';
    params.push(`%${filters.location}%`);
  }
  if (filters.listingType) {
    query += ' AND listing_type = ?';
    params.push(filters.listingType);
  }
  if (filters.sellerId) {
    query += ' AND seller_id = ?';
    params.push(filters.sellerId);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const [rows] = await db.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

async function search(query) {
  const searchTerm = `%${query}%`;
  const [rows] = await db.execute(
    'SELECT * FROM products WHERE title LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY created_at DESC',
    [searchTerm, searchTerm, searchTerm]
  );
  return rows;
}

async function create(productData) {
  const id = uuidv4();
  await db.execute(
    `INSERT INTO products (id, title, description, category, price, unit, listing_type, seller_id, seller_name, seller_image_url, seller_rating, image_urls, location, latitude, longitude, quantity, rating, review_count, created_at, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, productData.title, productData.description, productData.category, productData.price || 0, productData.unit || null, productData.listingType || 'forSale', productData.sellerId, productData.sellerName, productData.sellerImageUrl || null, productData.sellerRating || 0, JSON.stringify(productData.imageUrls || []), productData.location || null, productData.latitude || null, productData.longitude || null, productData.quantity || null, 0, 0, new Date(), true]
  );
  return findById(id);
}

async function update(id, updates) {
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length > 0) {
    values.push(id);
    await db.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return findById(id);
}

async function remove(id) {
  await db.execute('DELETE FROM products WHERE id = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  search,
  create,
  update,
  remove,
};