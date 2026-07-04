import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import './MatchesPage.css';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const unmatch = async (matchId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Unmatch this person? This cannot be undone.')) return;
    try {
      await api.delete(`/matches/${matchId}`);
      setMatches(prev => prev.filter(m => m.id !== matchId));
      toast.success('Unmatched.');
    } catch {
      toast.error('Could not unmatch.');
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="matches-page">
      <div className="matches-header">
        <h1>Matches</h1>
        <span className="matches-count">{matches.length}</span>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <div className="no-matches-icon float">💜</div>
          <h3>No matches yet</h3>
          <p>Start swiping to make connections with people from your college!</p>
          <Link to="/discover" className="btn btn-primary">
            Start swiping
          </Link>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map(match => (
            <Link
              to={`/chat/${match.roomId}`}
              key={match.id}
              className="match-item"
              state={{ matchedUser: match.user, matchId: match.id }}
            >
              <div className="match-avatar-wrap">
                {match.user?.photos?.[0] ? (
                  <img
                    src={match.user.photos[0].url}
                    alt={match.user.name}
                    className="match-avatar"
                  />
                ) : (
                  <div className="match-avatar-placeholder">
                    {match.user?.name?.[0] || '?'}
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
                  {match.user?.branch} • {match.user?.year}
                </div>
                {match.lastMessage ? (
                  <div className="match-preview">{match.lastMessage}</div>
                ) : (
                  <div className="match-new">Say hello! 👋</div>
                )}
              </div>

              <button
                className="unmatch-btn"
                onClick={(e) => unmatch(match.id, e)}
                title="Unmatch"
              >
                ⋯
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
