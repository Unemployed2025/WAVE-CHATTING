
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');


// Register a new user
const register = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        const userCheck = await pool.query(
            'SELECT * FROM Users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (userCheck[0].length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = uuidv4();
        await pool.query(
            'INSERT INTO Users (user_id,username,email,password_hash,full_name)VALUES (?, ?, ?, ?, ?)',
            [userId, username, email, hashedPassword, fullName]
        );

        // Generate JWT token
        const token = jwt.sign(
            { user_id: userId, username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { userId, username, email, fullName }
        });

    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email,password)

        const [users] = await pool.query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );
        // console.log(users);

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];
        // console.log(user);

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last_seen and is_online
        await pool.query(
            'UPDATE Users SET last_seen = NOW(), is_online = true WHERE user_id = ?',
            [user.user_id]
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//Logout user
const logout = async (req,res)=>{
    try{
        const userId = req.user.user_id;

        await pool.query(
            'UPDATE Users SET is_online = false, last_seen = NOW() WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            success:true,
            message:"Logout successful"
        });
    } catch(error){
        res.status(500).json({
            success:false,
            message:"Error logging out",
            error:error.message
        })
    }
}


// Search users
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user.user_id;

        // Validate query length
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters",
                users: []
            });
        }

        const [users] = await pool.query(`
            SELECT 
                user_id,
                username,
                full_name,
                avatar_url,
                is_online,
                (
                    SELECT EXISTS(
                        SELECT 1 FROM Friendships 
                        WHERE (user_one_id = Users.user_id AND user_two_id = ?) 
                        OR (user_two_id = Users.user_id AND user_one_id = ?)
                    )
                ) as is_friend
            FROM Users 
            WHERE 
                (username LIKE ? OR full_name LIKE ?) 
                AND user_id != ? 
                AND deleted_at IS NULL 
                AND is_active = true
            LIMIT 10
        `, [
            currentUserId,
            currentUserId,
            `${query}%`,
            `${query}%`,
            currentUserId
        ]);

        res.status(200).json({
            success: true,
            users: users.map(user => ({
                userId: user.user_id,
                username: user.username,
                fullName: user.full_name,
                avatarUrl: user.avatar_url,
                isOnline: Boolean(user.is_online),
                isFriend: Boolean(user.is_friend)
            }))
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: "Error searching users",
            error: error.message
        });
    }
};

//Give CurrentUserId
const getCurrentUserId = async(req,res)=>{
    try{
        const currentUserId = req.user.user_id;
        res.status(200).json({
            success:true,
            currentUserId
        });
    } catch(error){
        res.status(500).json({
            success:false,
            message:"Error fetching current user id",
            error:error.message
        });
    }
}


module.exports = {
    register,
    login,
    searchUsers,
    logout,
    getCurrentUserId
};