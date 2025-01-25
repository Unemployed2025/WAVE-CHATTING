import PropTypes from 'prop-types';

function MessageBubble({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`message-bubble max-w-[70%] break-words rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-500/80 text-white rounded-br-none backdrop-blur-sm'
            : 'bg-gray-800/80 text-gray-100 rounded-bl-none backdrop-blur-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      userId: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  isOwnMessage: PropTypes.bool.isRequired
};

export default MessageBubble;