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

//save message to database
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

// Create a new group
const createGroup = async (req, res) => {
    const { groupName, memberIds } = req.body;
    const creatorId = req.user.user_id;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Create new group conversation
            const conversationId = uuidv4();
            await connection.query(
                'INSERT INTO Conversations (conversation_id, name, is_group_chat, created_by) VALUES (?, ?, true, ?)',
                [conversationId, groupName, creatorId]
            );

            // Add creator as admin
            await connection.query(
                'INSERT INTO Conversation_Participants (conversation_id, user_id, is_admin) VALUES (?, ?, true)',
                [conversationId, creatorId]
            );

            // Add other members
            for (const memberId of memberIds) {
                await connection.query(
                    'INSERT INTO Conversation_Participants (conversation_id, user_id) VALUES (?, ?)',
                    [conversationId, memberId]
                );
            }

            await connection.commit();

            res.status(201).json({
                success: true,
                groupId: conversationId,
                message: "Group created successfully"
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating group",
            error: error.message
        });
    }
};

// Get group messages
const getGroupMessages = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { groupId } = req.params;

        // Verify user is a member of the group
        const [membership] = await pool.query(`
            SELECT 1 FROM Conversation_Participants 
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `, [groupId, currentUserId]);

        if (membership.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // Get messages
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
            INNER JOIN Users u ON m.sender_id = u.user_id
            WHERE m.conversation_id = ? AND m.deleted_at IS NULL
            ORDER BY m.created_at ASC
        `, [groupId]);

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
            message: "Error fetching group messages",
            error: error.message
        });
    }
};

// Send message to group
const sendGroupMessage = async (req, res) => {
    try {
        const senderId = req.user.user_id;
        const { groupId } = req.params;
        const { content } = req.body;

        // Verify user is a member of the group
        const [membership] = await pool.query(`
            SELECT 1 FROM Conversation_Participants 
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `, [groupId, senderId]);

        if (membership.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // Save message
        const messageId = uuidv4();
        await pool.query(
            'INSERT INTO Messages (message_id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)',
            [messageId, groupId, senderId, content]
        );

        res.status(201).json({
            success: true,
            messageId,
            message: "Message sent successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending message",
            error: error.message
        });
    }
};

// Get user's groups
const getUserGroups = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;

        const [groups] = await pool.query(`
            SELECT 
                c.conversation_id,
                c.name,
                c.created_at,
                c.created_by,
                u.username as creator_name,
                u.avatar_url as creator_avatar,
                COUNT(cp2.user_id) as member_count
            FROM Conversations c
            INNER JOIN Conversation_Participants cp1 ON c.conversation_id = cp1.conversation_id
            INNER JOIN Conversation_Participants cp2 ON c.conversation_id = cp2.conversation_id
            INNER JOIN Users u ON c.created_by = u.user_id
            WHERE c.is_group_chat = true
                AND cp1.user_id = ?
                AND cp1.left_at IS NULL
                AND cp2.left_at IS NULL
            GROUP BY c.conversation_id
            ORDER BY c.created_at DESC
        `, [currentUserId]);

        res.status(200).json({
            success: true,
            groups: groups.map(group => ({
                groupId: group.conversation_id,
                name: group.name,
                createdAt: group.created_at,
                creator: {
                    userId: group.created_by,
                    username: group.creator_name,
                    avatarUrl: group.creator_avatar
                },
                memberCount: group.member_count
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user groups",
            error: error.message
        });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { groupId } = req.params;

        // Verify user is a member
        const [membership] = await pool.query(`
            SELECT 1 FROM Conversation_Participants 
            WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL
        `, [groupId, currentUserId]);

        if (membership.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not a member of this group"
            });
        }

        // Get all members
        const [members] = await pool.query(`
            SELECT 
                u.user_id,
                u.username,
                u.avatar_url,
                cp.is_admin
            FROM Conversation_Participants cp
            INNER JOIN Users u ON cp.user_id = u.user_id
            WHERE cp.conversation_id = ? AND cp.left_at IS NULL
            ORDER BY cp.is_admin DESC, u.username ASC
        `, [groupId]);

        res.status(200).json({
            success: true,
            members: members.map(member => ({
                userId: member.user_id,
                username: member.username,
                avatarUrl: member.avatar_url,
                isAdmin: member.is_admin
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching group members",
            error: error.message
        });
    }
};


module.exports = {
    getMessagesBetweenUsers,
    saveMessage,
    createGroup,
    getGroupMessages,
    sendGroupMessage,
    getUserGroups,
    getGroupMembers
};