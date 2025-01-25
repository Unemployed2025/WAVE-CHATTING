/**
 * Create seed utility functions
 * Create sample data for Users
 * Create sample Conversations
 * Create Conversation Participants
 * Create sample Messages and Reactions
 * Add main seeding function
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

const users = [
    {
        user_id: uuidv4(),
        username: 'john_doe',
        email: 'john@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'John Doe',
        bio: 'Software Developer'
    },
    {
        user_id: uuidv4(),
        username: 'jane_smith',
        email: 'jane@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Jane Smith',
        bio: 'UI/UX Designer'
    },
    {
        user_id: uuidv4(),
        username: 'mike_wilson',
        email: 'mike@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Mike Wilson',
        bio: 'Project Manager'
    },
    {
        user_id: uuidv4(),
        username: 'sarah_dev',
        email: 'sarah@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Sarah Johnson',
        bio: 'Backend Developer'
    },
    {
        user_id: uuidv4(),
        username: 'alex_tech',
        email: 'alex@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Alex Chen',
        bio: 'DevOps Engineer'
    },
    {
        user_id: uuidv4(),
        username: 'emma_design',
        email: 'emma@example.com',
        password_hash: bcrypt.hashSync('password123', 10),
        full_name: 'Emma Williams',
        bio: 'Product Designer'
    }
];

async function seedUsers() {
    for (const user of users) {
        await pool.query(
            `INSERT INTO Users (user_id, username, email, password_hash, full_name, bio) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [user.user_id, user.username, user.email, user.password_hash, user.full_name, user.bio]
        );
    }
}

async function seedConversations() {
    const conversations = [
        {
            id: uuidv4(),
            name: 'Project Discussion',
            is_group_chat: true,
            created_by: users[0].user_id,
            participants: [0, 1, 2, 3] // indexes of users array
        },
        {
            id: uuidv4(),
            name: 'Design Team',
            is_group_chat: true,
            created_by: users[1].user_id,
            participants: [1, 4, 5] // indexes of users array
        },
        {
            id: uuidv4(),
            name: null, // Direct message
            is_group_chat: false,
            created_by: users[0].user_id,
            participants: [0, 2] // indexes of users array
        }
    ];

    for (const conv of conversations) {
        await pool.query(
            `INSERT INTO Conversations (conversation_id, name, is_group_chat, created_by) 
            VALUES (?, ?, ?, ?)`,
            [conv.id, conv.name, conv.is_group_chat, conv.created_by]
        );

        for (const participantIndex of conv.participants) {
            await pool.query(
                `INSERT INTO Conversation_Participants (conversation_id, user_id, is_admin) 
                VALUES (?, ?, ?)`,
                [conv.id, users[participantIndex].user_id, participantIndex === conv.participants[0]]
            );
        }
    }

    return conversations;
}

async function seedMessages(conversations) {
    for (const conv of conversations) {
        const messages = [
            {
                message_id: uuidv4(),
                content: 'Hey everyone! Welcome to the chat.',
                sender_id: users[conv.participants[0]].user_id
            },
            {
                message_id: uuidv4(),
                content: 'Thanks for the invite!',
                sender_id: users[conv.participants[1]].user_id
            },
            {
                message_id: uuidv4(),
                content: 'Looking forward to our collaboration!',
                sender_id: users[conv.participants[2]]?.user_id || users[conv.participants[0]].user_id
            }
        ];

        for (const message of messages) {
            await pool.query(
                `INSERT INTO Messages (message_id, conversation_id, sender_id, content) 
                VALUES (?, ?, ?, ?)`,
                [message.message_id, conv.id, message.sender_id, message.content]
            );

            // Add some reactions
            const reactions = ['👍', '❤️', '😄'];
            for (let i = 0; i < 2; i++) {
                await pool.query(
                    `INSERT INTO Message_Reactions (message_id, user_id, reaction)
                    VALUES (?, ?, ?)`,
                    [message.message_id, users[i].user_id, reactions[Math.floor(Math.random() * reactions.length)]]
                );
            }
        }
    }
}

async function seedFriendships() {
    // Create some friend requests and friendships
    const friendships = [
        { user_one: 0, user_two: 1 },
        { user_one: 0, user_two: 2 },
        { user_one: 1, user_two: 3 },
        { user_one: 2, user_two: 4 }
    ];

    for (const friendship of friendships) {
        const friendship_id = uuidv4();
        await pool.query(
            `INSERT INTO Friendships (friendship_id, user_one_id, user_two_id)
            VALUES (?, ?, ?)`,
            [friendship_id, users[friendship.user_one].user_id, users[friendship.user_two].user_id]
        );
    }
}

async function seedDatabase() {
    try {
        // Clear existing data
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE TABLE Message_Reactions');
        await pool.query('TRUNCATE TABLE Messages');
        await pool.query('TRUNCATE TABLE Conversation_Participants');
        await pool.query('TRUNCATE TABLE Conversations');
        await pool.query('TRUNCATE TABLE Users');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        // Seed data
        await seedUsers();
        const conversations = await seedConversations();
        await seedMessages(conversations);
        await seedFriendships();

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        process.exit(0);
    }
}

seedDatabase();