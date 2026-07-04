import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './SwipePage.css';

export default function SwipePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('both');
  const [swipeDir, setSwipeDir] = useState(null);
  const [matchData, setMatchData] = useState(null);

  // Drag state
  const cardRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, x: 0 });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/discover?mode=${mode}&limit=20`);
      setUsers(res.data.users);
      setCurrentIndex(0);
    } catch {
      toast.error('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const currentUser = users[currentIndex];

  const doSwipe = async (direction) => {
    if (!currentUser) return;
    setSwipeDir(direction);

    try {
      const res = await api.post('/users/swipe', {
        targetUserId: currentUser._id,
        direction,
        mode,
      });
      if (res.data.isMatch) setMatchData(res.data.match);
    } catch { /* silent */ }

    setTimeout(() => {
      setSwipeDir(null);
      setCurrentIndex(i => i + 1);
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.transition = '';
      }
    }, 350);
  };

  // Touch / Mouse drag handlers
  const onDragStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    dragState.current = { dragging: true, startX: x, x: 0 };
    if (cardRef.current) cardRef.current.style.transition = 'none';
  };

  const onDragMove = (e) => {
    if (!dragState.current.dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = x - dragState.current.startX;
    dragState.current.x = delta;
    const rotate = delta * 0.08;
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${delta}px) rotate(${rotate}deg)`;
    }
  };

  const onDragEnd = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const delta = dragState.current.x;

    if (cardRef.current) cardRef.current.style.transition = 'transform 0.3s ease';

    if (delta > 80) {
      doSwipe('right');
    } else if (delta < -80) {
      doSwipe('left');
    } else {
      // Snap back
      if (cardRef.current) cardRef.current.style.transform = '';
    }
  };

  const isEmpty = !loading && currentIndex >= users.length;

  return (
    <div className="swipe-page">
      {/* Mode switcher */}
      <div className="swipe-header">
        <div className="mode-toggle">
          {[
            { value: 'both', label: '✨ All' },
            { value: 'social', label: '🤝 Social' },
            { value: 'dating', label: '💜 Dating' },
          ].map(m => (
            <button
              key={m.value}
              className={`mode-btn ${mode === m.value ? 'active' : ''}`}
              onClick={() => setMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card area */}
      <div className="cards-container">
        {loading ? (
          <div className="flex-center" style={{ height: 460 }}>
            <div className="spinner" />
          </div>
        ) : isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon float">🎓</div>
            <h3>All caught up!</h3>
            <p>You've seen everyone from your college. Check back later as new students join.</p>
            <button className="btn btn-primary" onClick={fetchUsers}>Refresh</button>
          </div>
        ) : (
          <div className="cards-stack">
            {/* Next card preview (behind) */}
            {users[currentIndex + 1] && (
              <div className="profile-card profile-card-back">
                <div className="profile-card-photo">
                  {users[currentIndex + 1].photos?.[0] ? (
                    <img src={users[currentIndex + 1].photos[0].url} alt="" />
                  ) : (
                    <div className="photo-placeholder">{users[currentIndex + 1].name[0]}</div>
                  )}
                  <div className="photo-overlay" />
                </div>
              </div>
            )}

            {/* Current card */}
            <div
              ref={cardRef}
              className={`profile-card profile-card-front ${swipeDir === 'right' ? 'swipe-right' : ''} ${swipeDir === 'left' ? 'swipe-left' : ''}`}
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
            >
              {/* Like / Nope indicators */}
              <div className="stamp stamp-like">LIKE 💜</div>
              <div className="stamp stamp-nope">NOPE ✕</div>

              <div className="profile-card-photo">
                {currentUser.photos?.[0] ? (
                  <img src={currentUser.photos[0].url} alt={currentUser.name} draggable={false} />
                ) : (
                  <div className="photo-placeholder">{currentUser.name[0]}</div>
                )}
                <div className="photo-overlay" />
              </div>

              <div className="profile-card-info">
                <div className="profile-card-header">
                  <h2>{currentUser.name}, {currentUser.age}</h2>
                  <div className="profile-card-college">
                    🎓 {currentUser.branch} • {currentUser.year}
                  </div>
                </div>
                {currentUser.bio && (
                  <p className="profile-card-bio">{currentUser.bio}</p>
                )}
                {currentUser.interests?.length > 0 && (
                  <div className="profile-card-interests">
                    {currentUser.interests.slice(0, 4).map(i => (
                      <span key={i} className="tag tag-purple">{i}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      {!loading && !isEmpty && (
        <div className="swipe-actions">
          <button className="action-btn action-btn-nope" onClick={() => doSwipe('left')} title="Pass">✕</button>
          <button className="action-btn action-btn-like" onClick={() => doSwipe('right')} title="Like">♥</button>
        </div>
      )}

      {!loading && !isEmpty && (
        <div className="swipe-hint">
          <span>← Pass</span>
          <span>Drag or tap buttons</span>
          <span>Like →</span>
        </div>
      )}

      {/* Match Modal */}
      {matchData && (
        <div className="match-modal-overlay" onClick={() => setMatchData(null)}>
          <div className="match-modal match-burst" onClick={e => e.stopPropagation()}>
            <div className="match-emoji">🎉</div>
            <h2 className="text-gradient">It's a Match!</h2>
            <p>You and <strong>{matchData.matchedUser?.name}</strong> liked each other</p>
            <div className="match-actions">
              <button className="btn btn-primary" onClick={() => {
                setMatchData(null);
                window.location.href = `/chat/${matchData.roomId}`;
              }}>
                Send a message
              </button>
              <button className="btn btn-ghost" onClick={() => setMatchData(null)}>
                Keep swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
