import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './SetupProfilePage.css';

const ALL_INTERESTS = [
  'Coding', 'Hackathons', 'Gaming', 'Music', 'Sports', 'Reading',
  'Photography', 'Fitness', 'Travel', 'Movies', 'Cooking', 'Dancing',
  'Art', 'Design', 'Cricket', 'Football', 'Chess', 'Debate',
  'Entrepreneurship', 'AI/ML', 'Web Dev', 'Open Source', 'Anime', 'Writing',
];

const LOOKING_FOR_OPTIONS = [
  { value: 'friends', label: '👥 Friends', color: 'blue' },
  { value: 'study-partner', label: '📚 Study partner', color: 'purple' },
  { value: 'project-team', label: '💡 Project team', color: 'green' },
  { value: 'dating', label: '💜 Dating', color: 'pink' },
  { value: 'networking', label: '🌐 Networking', color: 'blue' },
];

export default function SetupProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [lookingFor, setLookingFor] = useState([]);
  const [mode, setMode] = useState('both');
  const [interestedIn, setInterestedIn] = useState('everyone');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : prev.length < 10 ? [...prev, interest] : prev
    );
  };

  const toggleLookingFor = (val) => {
    setLookingFor(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await api.post('/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotos(res.data.photos);
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (publicId) => {
    try {
      const encodedId = encodeURIComponent(publicId);
      const res = await api.delete(`/upload/photo/${encodedId}`);
      setPhotos(res.data.photos);
      toast.success('Photo removed.');
    } catch (err) {
      toast.error('Could not remove photo.');
    }
  };

  const handleFinish = async () => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo.');
      setStep(1);
      return;
    }
    if (bio.trim().length < 10) {
      toast.error('Please write a bio (at least 10 characters).');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/users/profile', {
        bio: bio.trim(),
        interests,
        lookingFor,
        mode,
        interestedIn,
      });
      updateUser(res.data.user);
      await refreshUser();
      toast.success('Profile set up! Welcome 🎉');
      navigate('/discover');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        {/* Progress */}
        <div className="setup-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <span className="progress-label">Step {step} of 3</span>
        </div>

        {/* Step 1 - Photos */}
        {step === 1 && (
          <div className="setup-step">
            <h2>Add your photos</h2>
            <p className="setup-subtitle">A picture is worth a thousand words. Add up to 6.</p>

            <div className="photos-grid">
              {photos.map((photo, i) => (
                <div key={photo.publicId} className="photo-item">
                  {i === 0 && <span className="photo-badge">Main</span>}
                  <img src={photo.url} alt={`Photo ${i + 1}`} />
                  <button className="photo-delete" onClick={() => deletePhoto(photo.publicId)}>✕</button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="photo-add">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} disabled={uploading} />
                  {uploading ? (
                    <div className="spinner" style={{ width: 28, height: 28 }} />
                  ) : (
                    <>
                      <span className="photo-add-icon">+</span>
                      <span>Add photo</span>
                    </>
                  )}
                </label>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 32 }}
              onClick={() => {
                if (photos.length === 0) { toast.error('Add at least one photo.'); return; }
                setStep(2);
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 - Bio + Interests */}
        {step === 2 && (
          <div className="setup-step">
            <h2>Tell them about you</h2>
            <p className="setup-subtitle">What makes you, you?</p>

            <div className="form-group">
              <label className="form-label">Bio <span className="char-count">{bio.length}/300</span></label>
              <textarea
                className="form-input form-textarea"
                placeholder="Hey! I'm a CS student who loves hackathons and midnight chai. Looking for people to build cool things with..."
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 300))}
                rows={4}
              />
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Interests <span className="char-count">{interests.length}/10</span></label>
              <div className="interests-grid">
                {ALL_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    className={`interest-tag ${interests.includes(interest) ? 'active' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (bio.trim().length < 10) { toast.error('Write a bio first.'); return; }
                  setStep(3);
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Preferences */}
        {step === 3 && (
          <div className="setup-step">
            <h2>Your preferences</h2>
            <p className="setup-subtitle">Help people find the right version of you.</p>

            <div className="form-group">
              <label className="form-label">I'm on CampusConnect for</label>
              <div className="looking-for-grid">
                {LOOKING_FOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`looking-tag tag-${opt.color} ${lookingFor.includes(opt.value) ? 'selected' : ''}`}
                    onClick={() => toggleLookingFor(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Show me in</label>
              <div className="mode-toggle">
                {[
                  { value: 'social', label: '🤝 Social' },
                  { value: 'dating', label: '💜 Dating' },
                  { value: 'both', label: '✨ Both' },
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

            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Interested in</label>
              <select className="form-select" value={interestedIn} onChange={e => setInterestedIn(e.target.value)}>
                <option value="everyone">Everyone</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="step-actions">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={handleFinish} disabled={saving}>
                {saving ? 'Saving...' : 'Finish setup 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
