import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ChatPage.css';

export default function ChatPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinRoom, sendMessage, onMessage, emitTyping, isOnline } = useSocket();

  const matchedUser = location.state?.matchedUser;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const inputRef = useRef(null);

  // Load messages
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data.messages);
      } catch {
        toast.error('Could not load messages.');
      } finally {
        setLoading(false);
      }
    };
    load();
    joinRoom(roomId);
  }, [roomId, joinRoom]);

  // Socket listener
  useEffect(() => {
    const cleanup = onMessage((msg) => {
      if (msg.roomId === roomId) {
        setMessages(prev => {
          // Avoid duplicate if we already added optimistically
          const exists = prev.some(m => m._id === msg._id || (m.tempId && m.tempId === msg.tempId));
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    });

    // Typing indicators
    const socket = window.__socket;
    return cleanup;
  }, [roomId, onMessage]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const tempId = Date.now().toString();
    const optimistic = {
      _id: tempId,
      tempId,
      roomId,
      content: text,
      sender: { _id: user._id, name: user.name, photos: user.photos },
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post(`/messages/${roomId}`, { content: text });
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.tempId === tempId ? res.data.message : m));
      // Also send via socket so other user sees it instantly
      sendMessage({ ...res.data.message, roomId });
    } catch {
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
      setInput(text);
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(roomId, true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(roomId, false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReport = async () => {
    if (!matchedUser) return;
    const reason = window.prompt('Why are you reporting this user? (harassment / inappropriate content / fake profile / other)');
    if (!reason) return;
    try {
      await api.post('/users/report', { targetUserId: matchedUser._id, reason });
      toast.success('User reported and blocked.');
      navigate('/matches');
    } catch {
      toast.error('Could not submit report.');
    }
  };

  const isMe = (msg) => {
    const senderId = msg.sender?._id || msg.sender;
    return senderId === user._id || senderId?.toString() === user._id?.toString();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate('/matches')}>←</button>
        <Link to={matchedUser ? `/profile/${matchedUser._id}` : '#'} className="chat-user-info">
          <div className="chat-avatar-wrap">
            {matchedUser?.photos?.[0] ? (
              <img src={matchedUser.photos[0].url} alt={matchedUser.name} className="chat-avatar" />
            ) : (
              <div className="chat-avatar-placeholder">{matchedUser?.name?.[0] || '?'}</div>
            )}
            {matchedUser && isOnline(matchedUser._id) && <span className="chat-online-dot" />}
          </div>
          <div>
            <div className="chat-username">{matchedUser?.name || 'Match'}</div>
            <div className="chat-status">
              {matchedUser && isOnline(matchedUser._id) ? (
                <span className="status-online">● Active now</span>
              ) : (
                <span className="status-offline">{matchedUser?.branch}</span>
              )}
            </div>
          </div>
        </Link>
        <div className="chat-menu-wrap">
          <button className="chat-menu-btn" onClick={() => setShowMenu(v => !v)}>⋯</button>
          {showMenu && (
            <div className="chat-dropdown">
              <button onClick={handleReport}>🚩 Report</button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" onClick={() => setShowMenu(false)}>
        {loading ? (
          <div className="flex-center" style={{ height: '100%' }}>
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>You matched! Send the first message.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const mine = isMe(msg);
              const prevMsg = messages[i - 1];
              const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
              return (
                <React.Fragment key={msg._id}>
                  {showDate && (
                    <div className="chat-date-divider">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                  )}
                  <div className={`msg-row ${mine ? 'mine' : 'theirs'}`}>
                    <div className={`msg-bubble ${mine ? 'bubble-mine' : 'bubble-theirs'} ${msg.pending ? 'bubble-pending' : ''}`}>
                      {msg.content}
                      <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {typing && (
              <div className="msg-row theirs">
                <div className="msg-bubble bubble-theirs typing-bubble">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={1000}
        />
        <button
          className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
