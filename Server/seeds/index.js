const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function truncateTables(client) {
    console.log('Truncating all tables...');
    await client.query(`
        TRUNCATE TABLE 
            Message_Reactions,
            Messages,
            Conversation_Participants,
            Conversations,
            Friend_Requests,
            Friendships,
            Users
        CASCADE
    `);
    console.log('Tables truncated');
}

async function seedUsers(client) {
    console.log('Seeding users...');
    const users = [
        {
            username: 'john_doe',
            email: 'john@example.com',
            password_hash: await bcrypt.hash('password123', 10),
            full_name: 'John Doe',
            bio: 'Software Developer'
        },
        {
            username: 'jane_smith',
            email: 'jane@example.com',
            password_hash: await bcrypt.hash('password123', 10),
            full_name: 'Jane Smith',
            bio: 'UI/UX Designer'
        }
    ];

    const values = users.map((_, index) => 
        `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
    ).join(',');

    const flatValues = users.flatMap(u => [u.username, u.email, u.password_hash, u.full_name, u.bio]);

    const result = await client.query(`
        INSERT INTO Users (username, email, password_hash, full_name, bio)
        VALUES ${values}
        RETURNING user_id
    `, flatValues);

    console.log(`${users.length} users seeded`);
    return result.rows.map(row => row.user_id);
}

async function seedDatabase() {
    const client = await pool.connect();
    console.log('Starting database seed...');
    
    try {
        await client.query('BEGIN');
        
        await truncateTables(client);
        const userIds = await seedUsers(client);
        
        console.log('Starting conversations seed...');
        const conversationId = await client.query(`
            INSERT INTO Conversations (name, is_group_chat, created_by)
            VALUES ('General Chat', true, $1)
            RETURNING conversation_id
        `, [userIds[0]]);
        
        console.log('Adding participants...');
        await client.query(`
            INSERT INTO Conversation_Participants (conversation_id, user_id, is_admin)
            VALUES ${userIds.map((_, i) => `($1, $${i + 2}, $${userIds.length + i + 2})`)}
        `, [conversationId.rows[0].conversation_id, ...userIds, ...userIds.map((_, i) => i === 0)]);

        console.log('Adding friendships...');
        await client.query(`
            INSERT INTO Friendships (user_one_id, user_two_id)
            VALUES ($1, $2)
        `, [userIds[0], userIds[1]]);

        await client.query('COMMIT');
        console.log('Database seeded successfully!');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

const TIMEOUT = 30000;
Promise.race([
    seedDatabase(),
    new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Seeding timed out')), TIMEOUT)
    )
])
.then(() => {
    console.log('Seeding completed');
    process.exit(0);
})
.catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
});