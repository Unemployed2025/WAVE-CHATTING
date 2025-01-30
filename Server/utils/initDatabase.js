const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    const schemaPath = path.join(__dirname, '..', 'Models', 'Schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    const queries = schema
      .split(';')
      .filter(query => query.trim());

    for (const query of queries) {
      if (query.trim()) {
        await client.query(query);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database schema initialized successfully');
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
    
  } finally {
    client.release();
  }
}

initDatabase()
  .then(() => {
    console.log('Database initialization complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });