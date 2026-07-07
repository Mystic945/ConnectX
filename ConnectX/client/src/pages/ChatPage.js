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
  const sentIds = useRef(new Set()); // track sent message IDs to avoid duplicates

  useEffect(() => {
    joinRoom(roomId);
    const cleanup = onMessage((msg) => {
      // Skip if we already have this message (sent by us via REST)
      if (sentIds.current.has(msg.tempId)) {
        sentIds.current.delete(msg.tempId);
        return;
      }
      setTyping(false);
      setMessages(prev => {
        // Avoid duplicate by _id
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    return cleanup;
  }, [roomId, joinRoom, onMessage]);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    emitTyping(roomId, false);

    // Generate a temp ID to track this message
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    // Add optimistic message locally
    const optimistic = {
      _id: tempId,
      content,
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      // Save to DB via REST only — don't emit via socket
      // (server will broadcast to the room via socket on its own if needed)
      const res = await api.post(`/messages/${roomId}`, { content });
      
      // Replace optimistic message with real one from server
      setMessages(prev => prev.map(m => m._id === tempId ? res.data.message : m));
      
      // Notify friend via socket
      sendMessage({ roomId, content, senderId: user._id, tempId, _id: res.data.message._id });
    } catch {
      toast.error('Could not send message.');
      setMessages(prev => prev.filter(m => m._id !== tempId));
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

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
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
          const senderId = msg.sender?._id || msg.sender;
          const isMe = senderId === user._id || senderId?.toString() === user._id?.toString();
          const nextMsg = messages[i + 1];
          const nextSenderId = nextMsg?.sender?._id || nextMsg?.sender;
          const showTime = !nextMsg ||
            nextSenderId?.toString() !== senderId?.toString() ||
            new Date(nextMsg.createdAt) - new Date(msg.createdAt) > 5 * 60 * 1000;

          return (
            <div key={msg._id} className={`msg-row ${isMe ? 'msg-me' : 'msg-them'}`}>
              <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-them'} ${msg.optimistic ? 'optimistic' : ''}`}>
                {msg.content}
              </div>
              {showTime && formatTime(msg.createdAt) && (
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
        <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim()}>
          ↑
        </button>
      </div>
    </div>
  );
}
