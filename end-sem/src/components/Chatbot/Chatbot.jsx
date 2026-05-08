import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Bot } from 'lucide-react';
import './Chatbot.css';

export default function Chatbot({ chatbot }) {
  const { messages, isTyping, isOpen, sendMessage, clearChat, toggleOpen } = chatbot;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab-active' : ''}`}
        onClick={toggleOpen}
        aria-label="Toggle chatbot"
        id="chatbot-toggle"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div>
              <span className="label" style={{ gap: '6px' }}>
                <Bot size={12} /> AI ASSISTANT
              </span>
              <div className="chatbot-header-badge">
                <span className="live-dot" style={{ width: 5, height: 5 }}></span>
                MISTRAL-7B • DASHBOARD ONLY
              </div>
            </div>
            <button className="btn-icon" onClick={clearChat} aria-label="Clear chat" id="chat-clear">
              <Trash2 size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-empty">
                <div className="chatbot-empty-icon">
                  <Bot size={24} />
                </div>
                <span className="heading-sm">ASK ME ANYTHING</span>
                <p className="body-sm" style={{ marginTop: '8px' }}>
                  About ISS location, speed, astronauts, or news articles on the dashboard.
                </p>
                <div className="chatbot-suggestions">
                  <button className="btn btn-sm" onClick={() => sendMessage('Where is the ISS right now?')}>
                    🛰️ ISS LOCATION
                  </button>
                  <button className="btn btn-sm" onClick={() => sendMessage('How fast is the ISS moving?')}>
                    ⚡ ISS SPEED
                  </button>
                  <button className="btn btn-sm" onClick={() => sendMessage('Who is in space right now?')}>
                    👨‍🚀 ASTRONAUTS
                  </button>
                  <button className="btn btn-sm" onClick={() => sendMessage('Summarize the latest news')}>
                    📰 NEWS SUMMARY
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-ai'}`}
              >
                <div className="chatbot-message-label">
                  {msg.role === 'user' ? 'YOU' : 'AI'}
                </div>
                <div className="chatbot-message-content">
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-message chatbot-message-ai">
                <div className="chatbot-message-label">AI</div>
                <div className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="input chatbot-input"
              placeholder="ASK ABOUT DASHBOARD DATA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              id="chatbot-input"
            />
            <button
              className="btn btn-lime chatbot-send"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              id="chatbot-send"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
