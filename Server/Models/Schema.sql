CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE Users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    bio TEXT,
    last_seen TIMESTAMP,
    is_online BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE Conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    is_group_chat BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(user_id)
);

CREATE TABLE Conversation_Participants (
    conversation_id UUID,
    user_id UUID,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID,
    sender_id UUID,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    parent_message_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (parent_message_id) REFERENCES Messages(message_id)
);

CREATE TABLE Message_Reactions (
    message_id UUID,
    user_id UUID,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES Messages(message_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Friend_Requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id),
    CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
);

CREATE TABLE Friendships (
    friendship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_one_id UUID NOT NULL,
    user_two_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_one_id) REFERENCES Users(user_id),
    FOREIGN KEY (user_two_id) REFERENCES Users(user_id),
    CONSTRAINT unique_friendship UNIQUE (user_one_id, user_two_id)
);

CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_messages_conversation ON Messages(conversation_id);
CREATE INDEX idx_messages_sender ON Messages(sender_id);
CREATE INDEX idx_messages_created_at ON Messages(created_at);
CREATE INDEX idx_friend_requests_sender ON Friend_Requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON Friend_Requests(receiver_id);
CREATE INDEX idx_friendships_user_one ON Friendships(user_one_id);
CREATE INDEX idx_friendships_user_two ON Friendships(user_two_id);