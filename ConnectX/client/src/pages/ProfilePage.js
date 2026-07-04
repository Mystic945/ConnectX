import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !userId || userId === currentUser._id;

  const [profile, setProfile] = useState(isOwnProfile ? currentUser : null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(!isOwnProfile);

  useEffect(() => {
    if (!isOwnProfile) {
      api.get(`/users/profile/${userId}`)
        .then(res => setProfile(res.data.user))
        .catch(() => toast.error('Could not load profile.'))
        .finally(() => setLoading(false));
    } else {
      setProfile(currentUser);
    }
  }, [userId, isOwnProfile, currentUser]);

  const handleReport = async () => {
    const reason = window.prompt('Report reason: harassment / fake profile / inappropriate / other');
    if (!reason) return;
    try {
      await api.post('/users/report', { targetUserId: profile._id, reason });
      toast.success('Reported and blocked.');
      navigate(-1);
    } catch {
      toast.error('Could not report.');
    }
  };

  const handleBlock = async () => {
    if (!window.confirm('Block this person? They will no longer appear in your feed.')) return;
    try {
      await api.post('/users/block', { targetUserId: profile._id });
      toast.success('User blocked.');
      navigate(-1);
    } catch {
      toast.error('Could not block.');
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>
  );

  if (!profile) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Profile not found.</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Go back</button>
      </div>
    </div>
  );

  const lookingForLabels = {
    'friends': '👥 Friends',
    'study-partner': '📚 Study partner',
    'project-team': '💡 Project team',
    'dating': '💜 Dating',
    'networking': '🌐 Networking',
  };

  return (
    <div className="profile-page">
      {/* Photo carousel */}
      <div className="profile-photos">
        {profile.photos?.length > 0 ? (
          <>
            <img
              src={profile.photos[photoIndex]?.url}
              alt={profile.name}
              className="profile-main-photo"
            />
            {profile.photos.length > 1 && (
              <div className="photo-dots">
                {profile.photos.map((_, i) => (
                  <button
                    key={i}
                    className={`photo-dot ${i === photoIndex ? 'active' : ''}`}
                    onClick={() => setPhotoIndex(i)}
                  />
                ))}
              </div>
            )}
            {photoIndex < profile.photos.length - 1 && (
              <button className="photo-nav photo-nav-right" onClick={() => setPhotoIndex(i => i + 1)}>›</button>
            )}
            {photoIndex > 0 && (
              <button className="photo-nav photo-nav-left" onClick={() => setPhotoIndex(i => i - 1)}>‹</button>
            )}
          </>
        ) : (
          <div className="profile-photo-placeholder">
            {profile.name?.[0]}
          </div>
        )}
      </div>

      {/* Profile body */}
      <div className="profile-body">
        {/* Name + actions */}
        <div className="profile-name-row">
          <div>
            <h1 className="profile-name">{profile.name}, {profile.age}</h1>
            <p className="profile-college">🎓 {profile.college}</p>
            <p className="profile-branch">{profile.branch} • {profile.year}</p>
          </div>
          {isOwnProfile ? (
            <Link to="/profile/edit" className="btn btn-secondary btn-sm">Edit</Link>
          ) : (
            <div className="profile-actions-other">
              <button className="btn btn-ghost btn-sm" onClick={handleBlock}>Block</button>
              <button className="btn btn-danger btn-sm" onClick={handleReport}>Report</button>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="profile-section">
            <h3>About</h3>
            <p className="profile-bio">{profile.bio}</p>
          </div>
        )}

        {/* Looking for */}
        {profile.lookingFor?.length > 0 && (
          <div className="profile-section">
            <h3>Looking for</h3>
            <div className="profile-tags">
              {profile.lookingFor.map(l => (
                <span key={l} className={`tag ${l === 'dating' ? 'tag-pink' : l === 'friends' ? 'tag-blue' : 'tag-purple'}`}>
                  {lookingForLabels[l] || l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="profile-section">
            <h3>Interests</h3>
            <div className="profile-tags">
              {profile.interests.map(i => (
                <span key={i} className="tag tag-purple">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="profile-section">
            <h3>Skills</h3>
            <div className="profile-tags">
              {profile.skills.map(s => (
                <span key={s} className="tag tag-green">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Own profile extras */}
        {isOwnProfile && (
          <div className="profile-section">
            <h3>Account</h3>
            <div className="account-links">
              <Link to="/profile/edit" className="account-link">✏️ Edit profile</Link>
              <button className="account-link account-link-danger" onClick={logout}>
                🚪 Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
