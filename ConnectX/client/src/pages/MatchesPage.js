import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import './MatchesPage.css';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isOnline } = useSocket();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matches');
        setMatches(res.data.matches);
      } catch {
        toast.error('Could not load matches.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    if (hrs < 24) return `${hrs}h`;
    return `${days}d`;
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="matches-page">
      <div className="matches-header">
        <div>
          <h1>Matches</h1>
          <p>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: 60 }}>
          <div className="empty-icon">💬</div>
          <h3>No matches yet</h3>
          <p>Start swiping to find your first match.</p>
          <button className="btn btn-primary" onClick={() => navigate('/discover')} style={{ marginTop: 8 }}>
            Discover people
          </button>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map(match => (
            <div
              key={match.id}
              className="match-item"
              onClick={() => navigate(`/chat/${match.roomId}`)}
            >
              <div className="match-avatar-wrap">
                {match.user?.photos?.[0] ? (
                  <img src={match.user.photos[0].url} alt={match.user.name} className="avatar" style={{ width: 48, height: 48 }} />
                ) : (
                  <div className="avatar-placeholder" style={{ width: 48, height: 48, fontSize: 18 }}>
                    {match.user?.name?.[0]}
                  </div>
                )}
                {isOnline(match.user?._id) && <span className="match-online-dot" />}
              </div>

              <div className="match-info">
                <div className="match-name-row">
                  <span className="match-name">{match.user?.name}</span>
                  {match.lastMessageAt && (
                    <span className="match-time">{timeAgo(match.lastMessageAt)}</span>
                  )}
                </div>
                <div className="match-sub">
                  {match.lastMessage
                    ? <span className="match-last-msg">{match.lastMessage}</span>
                    : <span className="match-new">New match · Say hello 👋</span>
                  }
                </div>
              </div>

              <div className="match-arrow">›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
