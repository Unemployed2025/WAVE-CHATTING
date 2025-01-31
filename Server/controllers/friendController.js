const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

// Send friend request
const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.user_id;
        const { receiverId } = req.body;

        // Validate receiver exists
        const receiver = await pool.query(
            'SELECT user_id FROM Users WHERE user_id = $1 AND deleted_at IS NULL',
            [receiverId]
        );

        if (receiver.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if users are already friends
        const existingFriendship = await pool.query(`
            SELECT 1 FROM Friendships 
            WHERE (user_one_id = $1 AND user_two_id = $2) 
            OR (user_one_id = $2 AND user_two_id = $1)
        `, [senderId, receiverId]);

        if (existingFriendship.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Users are already friends"
            });
        }

        // Check for existing friend request
        const existingRequest = await pool.query(`
            SELECT status FROM Friend_Requests 
            WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY sent_at DESC LIMIT 1
        `, [senderId, receiverId]);

        if (existingRequest.rows.length > 0) {
            const status = existingRequest.rows[0].status;
            if (status === 'pending') {
                return res.status(400).json({
                    success: false,
                    message: "Friend request already exists"
                });
            }
        }

        // Create new friend request
        const requestId = uuidv4();
        await pool.query(`
            INSERT INTO Friend_Requests 
            (request_id, sender_id, receiver_id) 
            VALUES ($1, $2, $3)
        `, [requestId, senderId, receiverId]);

        res.status(201).json({
            success: true,
            message: "Friend request sent successfully",
            requestId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending friend request",
            error: error.message
        });
    }
};

//Accept friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const receiverId = req.user.user_id;
        const { requestId } = req.body;

        // Start transaction
        const client = await pool.connect();
        await client.query('BEGIN');

        try {
            // Get and validate friend request
            const request = await client.query(`
                SELECT * FROM Friend_Requests 
                WHERE request_id = $1 AND receiver_id = $2 AND status = 'pending'
            `, [requestId, receiverId]);

            if (request.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: "Friend request not found or already processed"
                });
            }

            const senderId = request.rows[0].sender_id;

            // Update request status
            await client.query(`
                UPDATE Friend_Requests 
                SET status = 'accepted', responded_at = NOW() 
                WHERE request_id = $1
            `, [requestId]);

            // Create friendship
            const friendshipId = uuidv4();
            await client.query(`
                INSERT INTO Friendships (friendship_id, user_one_id, user_two_id) 
                VALUES ($1, $2, $3)
            `, [friendshipId, senderId, receiverId]);

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: "Friend request accepted",
                friendshipId
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error accepting friend request",
            error: error.message
        });
    }
};

//Pending friend requests
const getPendingRequests = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const pendingRequests = await pool.query(`
            SELECT 
                fr.request_id,
                fr.sent_at,
                u.user_id as sender_id,
                u.username as sender_username,
                u.full_name as sender_fullName,
                u.avatar_url as sender_avatar
            FROM Friend_Requests fr
            JOIN Users u ON fr.sender_id = u.user_id
            WHERE fr.receiver_id = $1 
            AND fr.status = 'pending'
            AND u.deleted_at IS NULL
            ORDER BY fr.sent_at DESC
        `, [currentUserId]);

        res.status(200).json({
            success: true,
            pendingRequests: pendingRequests.rows.map(request => ({
                requestId: request.request_id,
                sender: {
                    userId: request.sender_id,
                    username: request.sender_username,
                    fullName: request.sender_fullName,
                    avatarUrl: request.sender_avatar
                },
                sentAt: request.sent_at
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching pending friend requests",
            error: error.message
        });
    }
};

//Check if already friend
const checkFriendshipStatus = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { targetUserId } = req.params;

        const friendship = await pool.query(`
            SELECT 1 as is_friend
            FROM Friendships 
            WHERE (user_one_id = $1 AND user_two_id = $2) 
            OR (user_one_id = $2 AND user_two_id = $1)
            LIMIT 1
        `, [currentUserId, targetUserId, targetUserId, currentUserId]);

        const pendingRequest = await pool.query(`
            SELECT status, sender_id
            FROM Friend_Requests 
            WHERE ((sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1))
            AND status = 'pending'
            LIMIT 1
        `, [currentUserId, targetUserId, targetUserId, currentUserId]);

        res.status(200).json({
            success: true,
            isFriend: friendship.rows.length > 0,
            pendingRequest: pendingRequest.rows.length > 0 ? {
                status: 'pending',
                isSender: pendingRequest.rows[0].sender_id === currentUserId
            } : null
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error checking friendship status",
            error: error.message
        });
    }
};

// Get user's friends list
const getFriendsList = async (req, res) => {
    try {
        const userId = req.user.user_id; // From auth middleware
        // Get friends from both sides of friendship
        const friends = await pool.query(`
            SELECT 
                u.user_id,
                u.username,
                u.full_name,
                u.avatar_url,
                u.is_online,
                u.last_seen
            FROM Friendships f
            JOIN Users u ON 
                CASE 
                    WHEN f.user_one_id = $1 THEN f.user_two_id = u.user_id
                    WHEN f.user_two_id = $1 THEN f.user_one_id = u.user_id
                END
            WHERE 
                (f.user_one_id = $1 OR f.user_two_id = $1)
                AND u.deleted_at IS NULL
            ORDER BY u.is_online DESC, u.last_seen DESC
        `, [userId]);

        res.status(200).json({
            success: true,
            friends: friends.rows.map(friend => ({
                userId: friend.user_id,
                username: friend.username,
                fullName: friend.full_name,
                avatarUrl: friend.avatar_url,
                isOnline: friend.is_online,
                lastSeen: friend.last_seen
            }))
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error fetching friends list", 
            error: error.message 
        });
    }
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    getPendingRequests,
    checkFriendshipStatus,
    getFriendsList
}