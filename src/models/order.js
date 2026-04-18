const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

async function findAll(userId, role = 'buyer') {
  let query;
  const params = [userId];
  
  if (role === 'buyer') {
    query = 'SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC';
  } else if (role === 'seller') {
    query = 'SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC';
  } else {
    query = 'SELECT * FROM orders WHERE buyer_id = ? OR seller_id = ? ORDER BY created_at DESC';
    params.push(userId);
  }
  
  const [rows] = await db.execute(query, params);
  return rows;
}

async function findById(id) {
  const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(orderData) {
  const id = uuidv4();
  const totalAmount = orderData.quantity * orderData.unitPrice;
  
  await db.execute(
    'INSERT INTO orders (id, product_id, product_title, buyer_id, buyer_name, seller_id, seller_name, quantity, unit_price, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, orderData.productId, orderData.productTitle, orderData.buyerId, orderData.buyerName, orderData.sellerId, orderData.sellerName, orderData.quantity, orderData.unitPrice, totalAmount, 'pending', new Date()]
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
    await db.execute(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return findById(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
};