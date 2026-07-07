import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import './ChatPage.css';

export default function ChatPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { joinRoom, sendMessage, onMessage, emitTyping, isOnline } = useSocket();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    joinRoom(roomId);
    const cleanup = onMessage((msg) => {
      setMessages(prev => [...prev, msg]);
      setTyping(false);
    });
    return cleanup;
  }, [roomId, joinRoom, onMessage]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const [msgRes, matchRes] = await Promise.all([
          api.get(`/messages/${roomId}`),
          api.get('/matches'),
        ]);
        setMessages(msgRes.data.messages);
        const match = matchRes.data.matches.find(m => m.roomId === roomId);
        setMatchInfo(match);
      } catch {
        toast.error('Could not load chat.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    emitTyping(roomId, false);

    const optimistic = {
      _id: Date.now().toString(),
      content,
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      sendMessage({ roomId, content, senderId: user._id });
      await api.post(`/messages/${roomId}`, { content });
    } catch {
      toast.error('Could not send message.');
    }
  }, [input, roomId, user, sendMessage, emitTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(roomId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(roomId, false), 1500);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const otherUser = matchInfo?.user;

  if (loading) return <div className="flex-center" style={{ height: '100%' }}><div className="spinner" /></div>;

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back" onClick={() => navigate('/matches')}>←</button>
        <div className="chat-header-user">
          {otherUser?.photos?.[0] ? (
            <img src={otherUser.photos[0].url} alt="" className="avatar" style={{ width: 36, height: 36 }} />
          ) : (
            <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14 }}>
              {otherUser?.name?.[0]}
            </div>
          )}
          <div>
            <div className="chat-header-name">{otherUser?.name}</div>
            <div className="chat-header-status">
              {isOnline(otherUser?._id)
                ? <><span className="online-dot" /> Active now</>
                : otherUser?.branch && `${otherUser.branch} · ${otherUser.year}`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p>You matched with <strong>{otherUser?.name}</strong>.</p>
            <p>Say something!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.sender?._id === user._id || msg.sender === user._id;
          const showTime = i === messages.length - 1 ||
            new Date(messages[i + 1]?.createdAt) - new Date(msg.createdAt) > 5 * 60 * 1000;

          return (
            <div key={msg._id} className={`msg-row ${isMe ? 'msg-me' : 'msg-them'}`}>
              <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                {msg.content}
              </div>
              {showTime && (
                <div className="msg-time">{formatTime(msg.createdAt)}</div>
              )}
            </div>
          );
        })}

        {typing && (
          <div className="msg-row msg-them">
            <div className="bubble-them typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <textarea
          className="chat-input"
          placeholder="Message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
