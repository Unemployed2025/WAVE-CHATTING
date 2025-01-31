const { Server } = require('socket.io');
const { saveMessage } = require('../controllers/messageController');

function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.UI_URL,
            methods: ["GET", "POST"]
        }
    });

    // Store online users
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle user login
        socket.on('user_connected', (userId) => {
            socket.userId = userId; // Store userId in socket object
            onlineUsers.set(userId, socket.id);
            console.log('User logged in:', userId);
        });

        // Handle private messages
        socket.on('private_message', async ({ recipientId, message }) => {
            try {
                console.log(socket.userId,recipientId,message);
                // Save message to database
                const messageId = await saveMessage(
                    socket.userId,
                    recipientId,
                    message.content
                );

                // Update message with database ID
                const messageWithId = {
                    ...message,
                    messageId
                };

                // Send to recipient if online
                const recipientSocket = onlineUsers.get(recipientId);
                if (recipientSocket) {
                    io.to(recipientSocket).emit('receive_message', messageWithId);
                }

                // Send confirmation back to sender
                socket.emit('message_sent', {
                    success: true,
                    messageId,
                    temporaryId: message.messageId
                });

            } catch (error) {
                console.error('Error handling private message:', error);
                socket.emit('message_sent', {
                    success: false,
                    temporaryId: message.messageId,
                    error: 'Failed to save message'
                });
            }
        });

        // Add to existing socket.io configuration
        socket.on('join_group', (groupId) => {
            socket.join(`group_${groupId}`);
        });

        socket.on('leave_group', (groupId) => {
            socket.leave(`group_${groupId}`);
        });

        socket.on('group_message', async ({ groupId, message }) => {
            try {
                // Save message to database
                const messageId = uuidv4();
                await pool.query(
                    'INSERT INTO messages (message_id, conversation_id, sender_id, content) VALUES ($1, $2, $3, $4)',
                    [messageId, groupId, socket.userId, message.content]
                );

                // Broadcast message to all group members
                io.to(`group_${groupId}`).emit('receive_group_message', {
                    ...message,
                    messageId,
                    groupId
                });

            } catch (error) {
                console.error('Error handling group message:', error);
                socket.emit('message_error', {
                    error: 'Failed to send group message'
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            // Remove user from online users
            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });

        //handle typing
        socket.on('typing', ({ recipientId, isTyping }) => {
            const recipientSocket = onlineUsers.get(recipientId);
            if (recipientSocket) {
                io.to(recipientSocket).emit('user_typing', { userId: socket.userId, isTyping });
            }
        });
    });

    return io;
}

module.exports = initSocket;