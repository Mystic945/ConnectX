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
  const cardRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, x: 0 });

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
      const res = await api.post('/users/swipe', { targetUserId: currentUser._id, direction, mode });
      if (res.data.isMatch) setMatchData(res.data.match);
    } catch { /* silent */ }
    setTimeout(() => {
      setSwipeDir(null);
      setCurrentIndex(i => i + 1);
      if (cardRef.current) { cardRef.current.style.transform = ''; cardRef.current.style.transition = ''; }
    }, 350);
  };

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

    // Show stamp based on direction
    const card = cardRef.current;
    if (card) {
      card.style.transform = `translateX(${delta}px) rotate(${delta * 0.07}deg)`;
      const likeStamp = card.querySelector('.stamp-like');
      const nopeStamp = card.querySelector('.stamp-nope');
      if (likeStamp) likeStamp.style.opacity = Math.min(delta / 60, 1) > 0 ? Math.min(delta / 60, 1) : 0;
      if (nopeStamp) nopeStamp.style.opacity = Math.min(-delta / 60, 1) > 0 ? Math.min(-delta / 60, 1) : 0;
    }
  };

  const onDragEnd = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const delta = dragState.current.x;
    if (cardRef.current) cardRef.current.style.transition = 'transform 0.3s ease';
    if (delta > 80) doSwipe('right');
    else if (delta < -80) doSwipe('left');
    else {
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        const likeStamp = cardRef.current.querySelector('.stamp-like');
        const nopeStamp = cardRef.current.querySelector('.stamp-nope');
        if (likeStamp) likeStamp.style.opacity = 0;
        if (nopeStamp) nopeStamp.style.opacity = 0;
      }
    }
  };

  const isEmpty = !loading && currentIndex >= users.length;

  return (
    <div className="swipe-page">
      <div className="swipe-desktop-wrapper">

        {/* Main swipe area */}
        <div className="swipe-main">
          {/* Mode switcher */}
          <div className="swipe-header">
            <div className="mode-toggle">
              {[
                { value: 'both',   label: '✨ All'    },
                { value: 'social', label: '🤝 Social' },
                { value: 'dating', label: '💜 Dating' },
              ].map(m => (
                <button key={m.value} className={`mode-btn ${mode === m.value ? 'active' : ''}`} onClick={() => setMode(m.value)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="cards-area">
            {loading ? (
              <div className="flex-center" style={{ height: 460 }}><div className="spinner" /></div>
            ) : isEmpty ? (
              <div className="empty-state">
                <div className="empty-icon float">🎓</div>
                <h3>All caught up!</h3>
                <p>You've seen everyone. Check back as new students join.</p>
                <button className="btn btn-secondary" onClick={fetchUsers} style={{ marginTop: 8 }}>Refresh</button>
              </div>
            ) : (
              <div className="cards-stack">
                {/* Back card preview */}
                {users[currentIndex + 1] && (
                  <div className="profile-card profile-card-back">
                    <div className="profile-card-photo">
                      {users[currentIndex + 1].photos?.[0]
                        ? <img src={users[currentIndex + 1].photos[0].url} alt="" />
                        : <div className="photo-placeholder">{users[currentIndex + 1].name[0]}</div>
                      }
                      <div className="photo-overlay" />
                    </div>
                  </div>
                )}

                {/* Front card */}
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
                  <div className="stamp stamp-like">LIKE</div>
                  <div className="stamp stamp-nope">NOPE</div>

                  <div className="profile-card-photo">
                    {currentUser.photos?.[0]
                      ? <img src={currentUser.photos[0].url} alt={currentUser.name} draggable={false} />
                      : <div className="photo-placeholder">{currentUser.name[0]}</div>
                    }
                    <div className="photo-overlay" />
                  </div>

                  <div className="profile-card-info">
                    <div className="profile-card-name">{currentUser.name}, {currentUser.age}</div>
                    <div className="profile-card-sub">🎓 {currentUser.branch} · {currentUser.year}</div>
                    {currentUser.bio && <p className="profile-card-bio">{currentUser.bio}</p>}
                    {currentUser.interests?.length > 0 && (
                      <div className="profile-card-tags">
                        {currentUser.interests.slice(0, 3).map(i => (
                          <span key={i} className="tag tag-zinc" style={{ fontSize: 11 }}>{i}</span>
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
            <>
              <div className="swipe-actions">
                <button className="action-btn action-btn-nope" onClick={() => doSwipe('left')}>✕</button>
                <button className="action-btn action-btn-like" onClick={() => doSwipe('right')}>♥</button>
              </div>
              <div className="swipe-hint">
                <span>← Pass</span>
                <span>Drag or tap</span>
                <span>Like →</span>
              </div>
            </>
          )}
        </div>

        {/* Desktop side panel */}
        <div className="swipe-side-panel">
          <div className="side-panel-card">
            <div className="side-panel-title">How it works</div>
            <div className="side-panel-tip">
              👉 Swipe right or tap ♥ to like someone<br /><br />
              ✕ to pass<br /><br />
              When both of you like each other — it's a match! 🎉<br /><br />
              Then you can chat in real time.
            </div>
          </div>

          {user && (
            <div className="side-panel-card">
              <div className="side-panel-title">Your profile</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.photos?.[0]
                  ? <img src={user.photos[0].url} alt="" className="avatar" style={{ width: 40, height: 40 }} />
                  : <div className="avatar-placeholder" style={{ width: 40, height: 40 }}>{user.name[0]}</div>
                }
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user.branch} · {user.year}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Match Modal */}
      {matchData && (
        <div className="match-modal-overlay" onClick={() => setMatchData(null)}>
          <div className="match-modal match-pop" onClick={e => e.stopPropagation()}>
            <div className="match-emoji">🎉</div>
            <h2>It's a Match!</h2>
            <p>You and <strong style={{ color: 'var(--text-1)' }}>{matchData.matchedUser?.name}</strong> liked each other</p>
            <div className="match-modal-actions">
              <button className="btn btn-primary btn-lg" onClick={() => { setMatchData(null); window.location.href = `/chat/${matchData.roomId}`; }}>
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
