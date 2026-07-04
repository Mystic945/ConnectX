import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MatchModal.css';

export default function MatchModal({ match, currentUser, onClose }) {
  const navigate = useNavigate();

  const handleChat = () => {
    onClose();
    navigate(`/chat/${match.roomId}`, {
      state: { matchedUser: match.matchedUser }
    });
  };

  return (
    <div className="match-overlay" onClick={onClose}>
      <div className="match-modal match-burst" onClick={e => e.stopPropagation()}>
        <div className="match-glow" />

        <div className="match-title-wrap">
          <h1 className="match-title">It's a Match!</h1>
          <p className="match-subtitle">
            You and <strong>{match.matchedUser?.name}</strong> liked each other 💜
          </p>
        </div>

        <div className="match-avatars">
          {/* Current user */}
          <div className="match-avatar-item">
            {currentUser?.photos?.[0] ? (
              <img src={currentUser.photos[0].url} alt={currentUser.name} />
            ) : (
              <div className="match-avatar-ph">{currentUser?.name?.[0]}</div>
            )}
          </div>

          <div className="match-heart">💜</div>

          {/* Matched user */}
          <div className="match-avatar-item">
            {match.matchedUser?.photos?.[0] ? (
              <img src={match.matchedUser.photos[0].url} alt={match.matchedUser.name} />
            ) : (
              <div className="match-avatar-ph">{match.matchedUser?.name?.[0]}</div>
            )}
          </div>
        </div>

        <div className="match-actions">
          <button className="btn btn-primary btn-lg" onClick={handleChat}>
            Send a message
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}
