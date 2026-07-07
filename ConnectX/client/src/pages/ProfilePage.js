import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isOwnProfile) {
          setProfile(currentUser);
          setLoading(false);
        } else {
          const res = await api.get(`/users/profile/${userId}`);
          setProfile(res.data.user);
          setLoading(false);
        }
      } catch {
        toast.error('Could not load profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, isOwnProfile, currentUser]);

  const handleReport = async () => {
    if (!window.confirm('Report this user?')) return;
    try {
      await api.post('/users/report', { targetUserId: userId, reason: 'Inappropriate behavior' });
      toast.success('User reported.');
    } catch {
      toast.error('Could not report.');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" /></div>;
  if (!profile) return <div className="flex-center" style={{ height: '60vh', color: 'var(--text-3)' }}>Profile not found.</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-photo-wrap">
            {profile.photos?.[0] ? (
              <img src={profile.photos[0].url} alt={profile.name} className="profile-main-photo" />
            ) : (
              <div className="profile-photo-placeholder">{profile.name[0]}</div>
            )}
          </div>
          <div className="profile-header-info">
            <div className="profile-name-row">
              <h1 className="profile-name">{profile.name}{profile.age ? `, ${profile.age}` : ''}</h1>
              {isOwnProfile && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/profile/edit')}>
                  Edit
                </button>
              )}
            </div>
            <div className="profile-college">🎓 {profile.college}</div>
            <div className="profile-sub">{profile.branch} · {profile.year}</div>
            <div className="profile-tags">
              {profile.lookingFor?.map(l => (
                <span key={l} className="tag tag-indigo">{l}</span>
              ))}
              {profile.mode && profile.mode !== 'both' && (
                <span className="tag tag-zinc">{profile.mode}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="profile-section">
            <div className="profile-section-label">About</div>
            <p className="profile-bio">{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="profile-section">
            <div className="profile-section-label">Interests</div>
            <div className="profile-chips">
              {profile.interests.map(i => <span key={i} className="tag tag-zinc">{i}</span>)}
            </div>
          </div>
        )}

        {/* Photos */}
        {profile.photos?.length > 1 && (
          <div className="profile-section">
            <div className="profile-section-label">Photos</div>
            <div className="profile-photos-grid">
              {profile.photos.slice(1).map((p, i) => (
                <img key={i} src={p.url} alt="" className="profile-grid-photo" />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="profile-actions">
          {isOwnProfile ? (
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: 'var(--red)' }}>
              Log out
            </button>
          ) : (
            <button className="btn btn-danger btn-sm" onClick={handleReport}>
              Report user
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
