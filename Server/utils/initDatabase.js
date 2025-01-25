const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function initDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Create UUID generation function
    await connection.query(`
      CREATE FUNCTION IF NOT EXISTS uuid_v4()
      RETURNS CHAR(36)
      NOT DETERMINISTIC
      NO SQL
      BEGIN
        RETURN UUID();
      END;
    `);
    const schemaPath = path.join(__dirname, '..', 'Models', 'Schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    const queries = schema
      .split(';')
      .filter(query => query.trim());


    for (const query of queries) {
      if (query.trim()) {
        await connection.query(query);
      }
    }

    connection.release();
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

initDatabase()
  .then(() => {
    console.log('Database initialized');
    pool.end(); // Close all connections in the pool
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });