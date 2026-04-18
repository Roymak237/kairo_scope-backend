const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

async function findByEmail(email) {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(userData) {
  const id = uuidv4();
  await db.execute(
    'INSERT INTO users (id, name, email, password, phone, profile_image_url, bio, rating, review_count, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userData.name, userData.email, userData.password, userData.phone, null, null, 0.0, 0, null, new Date()]
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
    await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return findById(id);
}

module.exports = {
  findByEmail,
  findById,
  create,
  update,
};