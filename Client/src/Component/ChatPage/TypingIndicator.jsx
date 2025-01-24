
function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-blue-300/70">
      <span className="text-sm">Typing</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="typing-dot w-2 h-2 bg-blue-400/60 rounded-full"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default TypingIndicator;