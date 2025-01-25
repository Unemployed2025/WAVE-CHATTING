const pool = require('../config/database');
const {v4 :uuidv4} = require('uuid');

//Give all Message Between Two Users
const getMessagesBetweenUsers = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { friendId } = req.params;
        
        // console.log(currentUserId, friendId);
        // Find conversations between these users
        const [messages] = await pool.query(`
            SELECT 
                m.message_id,
                m.content,
                m.is_edited,
                m.created_at,
                m.updated_at,
                m.parent_message_id,
                u.user_id as sender_id,
                u.username as sender_username,
                u.avatar_url as sender_avatar
            FROM Messages m
            INNER JOIN Conversations c ON m.conversation_id = c.conversation_id
            INNER JOIN Conversation_Participants cp1 ON c.conversation_id = cp1.conversation_id
            INNER JOIN Conversation_Participants cp2 ON c.conversation_id = cp2.conversation_id
            INNER JOIN Users u ON m.sender_id = u.user_id
            WHERE 
                c.is_group_chat = false
                AND cp1.user_id = ?
                AND cp2.user_id = ?
                AND m.deleted_at IS NULL
            ORDER BY m.created_at ASC
        `, [currentUserId, friendId]);

        res.status(200).json({
            success: true,
            messages: messages.map(msg => ({
                messageId: msg.message_id,
                content: msg.content,
                isEdited: msg.is_edited,
                createdAt: msg.created_at,
                updatedAt: msg.updated_at,
                parentMessageId: msg.parent_message_id,
                sender: {
                    userId: msg.sender_id,
                    username: msg.sender_username,
                    avatarUrl: msg.sender_avatar
                }
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching messages",
            error: error.message
        });
    }
};

const saveMessage = async (senderId, recipientId, content) => {
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            // Find or create conversation
            let [conversation] = await connection.query(`
                SELECT c.conversation_id 
                FROM Conversations c
                INNER JOIN Conversation_Participants cp1 ON c.conversation_id = cp1.conversation_id
                INNER JOIN Conversation_Participants cp2 ON c.conversation_id = cp2.conversation_id
                WHERE c.is_group_chat = false
                AND ((cp1.user_id = ? AND cp2.user_id = ?) 
                OR (cp1.user_id = ? AND cp2.user_id = ?))
                LIMIT 1
            `, [senderId, recipientId, recipientId, senderId]);

            let conversationId;
            if (conversation.length === 0) {
                // Create new conversation
                conversationId = uuidv4();
                await connection.query(
                    'INSERT INTO Conversations (conversation_id, is_group_chat, created_by) VALUES (?, false, ?)',
                    [conversationId, senderId]
                );

                // Add participants
                await connection.query(
                    'INSERT INTO Conversation_Participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
                    [conversationId, senderId, conversationId, recipientId]
                );
            } else {
                conversationId = conversation[0].conversation_id;
            }

            // Save message
            const messageId = uuidv4();
            await connection.query(
                'INSERT INTO Messages (message_id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)',
                [messageId, conversationId, senderId, content]
            );

            await connection.commit();
            return messageId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
};

module.exports = {
    getMessagesBetweenUsers,
    saveMessage
};