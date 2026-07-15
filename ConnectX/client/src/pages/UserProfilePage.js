import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './UserProfilePage.css';

// LOOKING FOR labels with icons
const LOOKING_FOR_LABELS = {
  'friends':      '👥 Friends',
  'study-partner':'📚 Study partner',
  'project-team': '💡 Project team',
  'dating':       '💜 Dating',
  'networking':   '🌐 Networking',
};

export default function UserProfilePage() {
  const { userId } = useParams();       // comes from URL: /profile/:userId
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0); // which photo is shown
  const [showReportMenu, setShowReportMenu] = useState(false);

  const isOwnProfile = userId === currentUser?._id?.toString();

  // Step 1: Fetch the profile data when page loads
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If viewing own profile, use /auth/me
        // If viewing someone else, use /users/profile/:id
        const endpoint = isOwnProfile
          ? '/auth/me'
          : `/users/profile/${userId}`;

        const res = await api.get(endpoint);
        const userData = isOwnProfile ? res.data.user : res.data.user;
        setProfile(userData);
      } catch (err) {
        toast.error('Could not load profile.');
        navigate(-1); // go back
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isOwnProfile, navigate]);

  // Step 2: Handle photo carousel navigation
  const nextPhoto = () => {
    if (profile.photos?.length > 1) {
      setPhotoIndex(i => (i + 1) % profile.photos.length);
    }
  };

  const prevPhoto = () => {
    if (profile.photos?.length > 1) {
      setPhotoIndex(i => (i - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  // Step 3: Report user
  const handleReport = async () => {
    if (!window.confirm(`Report ${profile.name}? They will be blocked from your feed.`)) return;
    try {
      await api.post('/users/report', {
        targetUserId: userId,
        reason: 'Inappropriate behavior',
      });
      toast.success('User reported and blocked.');
      setShowReportMenu(false);
      navigate(-1);
    } catch {
      toast.error('Could not report user.');
    }
  };

  // Step 4: Block user
  const handleBlock = async () => {
    if (!window.confirm(`Block ${profile.name}? You won't see them anymore.`)) return;
    try {
      await api.post('/users/block', { targetUserId: userId });
      toast.success('User blocked.');
      setShowReportMenu(false);
      navigate(-1);
    } catch {
      toast.error('Could not block user.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Not found
  if (!profile) {
    return (
      <div className="profile-not-found">
        <div style={{ fontSize: 48 }}>🔍</div>
        <h3>Profile not found</h3>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const photos = profile.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  return (
    <div className="user-profile-page">

      {/* ── Top bar with back button and options ── */}
      <div className="profile-topbar">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        {!isOwnProfile && (
          <div className="profile-options">
            <button
              className="profile-options-btn"
              onClick={() => setShowReportMenu(!showReportMenu)}
            >
              ⋯
            </button>
            {showReportMenu && (
              <div className="profile-options-menu">
                <button onClick={handleBlock}>🚫 Block</button>
                <button onClick={handleReport} className="danger">🚩 Report</button>
              </div>
            )}
          </div>
        )}
        {isOwnProfile && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/profile/edit')}
          >
            Edit profile
          </button>
        )}
      </div>

      <div className="profile-content">

        {/* ── Photo carousel ── */}
        <div className="profile-photos-section">
          {photos.length > 0 ? (
            <div className="photo-carousel">
              <img
                src={photos[photoIndex]?.url}
                alt={profile.name}
                className="carousel-main-photo"
              />

              {/* Photo counter dots */}
              {hasMultiplePhotos && (
                <div className="carousel-dots">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      className={`carousel-dot ${i === photoIndex ? 'active' : ''}`}
                      onClick={() => setPhotoIndex(i)}
                    />
                  ))}
                </div>
              )}

              {/* Left / right arrows */}
              {hasMultiplePhotos && (
                <>
                  <button className="carousel-arrow carousel-arrow-left" onClick={prevPhoto}>‹</button>
                  <button className="carousel-arrow carousel-arrow-right" onClick={nextPhoto}>›</button>
                </>
              )}

              {/* Photo count badge */}
              {hasMultiplePhotos && (
                <div className="carousel-count">
                  {photoIndex + 1} / {photos.length}
                </div>
              )}
            </div>
          ) : (
            <div className="profile-no-photo">
              {profile.name?.[0]}
            </div>
          )}
        </div>

        {/* ── Profile info ── */}
        <div className="profile-info-section">

          {/* Name, age, online status */}
          <div className="profile-name-block">
            <h1 className="profile-name">
              {profile.name}
              {profile.age && <span className="profile-age">, {profile.age}</span>}
            </h1>
            <div className="profile-college-row">
              🎓 {profile.college}
            </div>
            <div className="profile-branch-row">
              {profile.branch} · {profile.year}
            </div>
          </div>

          {/* Bio */}
          {profile.bio ? (
            <div className="profile-section">
              <div className="profile-section-title">About</div>
              <p className="profile-bio-text">{profile.bio}</p>
            </div>
          ) : null}

          {/* Looking for */}
          {profile.lookingFor?.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">Looking for</div>
              <div className="profile-tags-row">
                {profile.lookingFor.map(l => (
                  <span key={l} className="profile-tag profile-tag-indigo">
                    {LOOKING_FOR_LABELS[l] || l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">Interests</div>
              <div className="profile-tags-row">
                {profile.interests.map(interest => (
                  <span key={interest} className="profile-tag profile-tag-zinc">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">Skills</div>
              <div className="profile-tags-row">
                {profile.skills.map(skill => (
                  <span key={skill} className="profile-tag profile-tag-green">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All photos grid (if more than 1) */}
          {photos.length > 1 && (
            <div className="profile-section">
              <div className="profile-section-title">Photos</div>
              <div className="profile-photos-grid">
                {photos.map((photo, i) => (
                  <img
                    key={i}
                    src={photo.url}
                    alt={`${profile.name} ${i + 1}`}
                    className={`grid-photo ${i === photoIndex ? 'grid-photo-active' : ''}`}
                    onClick={() => setPhotoIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bottom spacer for mobile */}
          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}
