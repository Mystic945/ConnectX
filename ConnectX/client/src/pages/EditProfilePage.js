import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './EditProfilePage.css';

const ALL_INTERESTS = [
  'Coding', 'Hackathons', 'Gaming', 'Music', 'Sports', 'Reading',
  'Photography', 'Fitness', 'Travel', 'Movies', 'Cooking', 'Dancing',
  'Art', 'Design', 'Cricket', 'Football', 'Chess', 'Debate',
  'Entrepreneurship', 'AI/ML', 'Web Dev', 'Open Source', 'Anime', 'Writing',
];

export default function EditProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: user.bio || '',
    interests: user.interests || [],
    lookingFor: user.lookingFor || [],
    mode: user.mode || 'both',
    interestedIn: user.interestedIn || 'everyone',
  });
  const [photos, setPhotos] = useState(user.photos || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleInterest = (i) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter(x => x !== i)
        : f.interests.length < 10 ? [...f.interests, i] : f.interests,
    }));
  };

  const toggleLookingFor = (val) => {
    setForm(f => ({
      ...f,
      lookingFor: f.lookingFor.includes(val)
        ? f.lookingFor.filter(v => v !== val)
        : [...f.lookingFor, val],
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB per photo.'); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await api.post('/upload/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      const res = await api.delete(`/upload/photo/${encodeURIComponent(publicId)}`);
      setPhotos(res.data.photos);
    } catch { toast.error('Could not delete photo.'); }
  };

  const handleSave = async () => {
    if (form.bio.trim().length < 10) { toast.error('Bio must be at least 10 characters.'); return; }
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      updateUser(res.data.user);
      await refreshUser();
      toast.success('Profile saved!');
      navigate('/profile');
    } catch {
      toast.error('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const lookingForOpts = [
    { value: 'friends', label: '👥 Friends' },
    { value: 'study-partner', label: '📚 Study partner' },
    { value: 'project-team', label: '💡 Project team' },
    { value: 'dating', label: '💜 Dating' },
    { value: 'networking', label: '🌐 Networking' },
  ];

  return (
    <div className="edit-page">
      <div className="edit-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')}>← Cancel</button>
        <h2>Edit profile</h2>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="edit-body">
        {/* Photos */}
        <section className="edit-section">
          <h3>Photos</h3>
          <div className="edit-photos-grid">
            {photos.map((p, i) => (
              <div key={p.publicId} className="edit-photo-item">
                {i === 0 && <span className="photo-badge">Main</span>}
                <img src={p.url} alt="" />
                <button className="photo-delete" onClick={() => deletePhoto(p.publicId)}>✕</button>
              </div>
            ))}
            {photos.length < 6 && (
              <label className="photo-add">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} disabled={uploading} />
                {uploading ? <div className="spinner" style={{ width: 24, height: 24 }} /> : <><span style={{ fontSize: 24, color: 'var(--purple)' }}>+</span><span>Add</span></>}
              </label>
            )}
          </div>
        </section>

        {/* Bio */}
        <section className="edit-section">
          <h3>Bio <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{form.bio.length}/300</span></h3>
          <textarea
            className="form-input form-textarea"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 300) }))}
            rows={4}
            placeholder="Write something about yourself..."
          />
        </section>

        {/* Mode */}
        <section className="edit-section">
          <h3>Show me in</h3>
          <div className="mode-toggle">
            {[{ value: 'social', label: '🤝 Social' }, { value: 'dating', label: '💜 Dating' }, { value: 'both', label: '✨ Both' }].map(m => (
              <button key={m.value} className={`mode-btn ${form.mode === m.value ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, mode: m.value }))}>{m.label}</button>
            ))}
          </div>
        </section>

        {/* Interested in */}
        <section className="edit-section">
          <h3>Interested in</h3>
          <select className="form-select" value={form.interestedIn} onChange={set('interestedIn')}>
            <option value="everyone">Everyone</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </section>

        {/* Looking for */}
        <section className="edit-section">
          <h3>Looking for</h3>
          <div className="edit-tags-grid">
            {lookingForOpts.map(o => (
              <button
                key={o.value}
                className={`interest-tag ${form.lookingFor.includes(o.value) ? 'active' : ''}`}
                onClick={() => toggleLookingFor(o.value)}
              >{o.label}</button>
            ))}
          </div>
        </section>

        {/* Interests */}
        <section className="edit-section">
          <h3>Interests <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{form.interests.length}/10</span></h3>
          <div className="edit-tags-grid">
            {ALL_INTERESTS.map(i => (
              <button
                key={i}
                className={`interest-tag ${form.interests.includes(i) ? 'active' : ''}`}
                onClick={() => toggleInterest(i)}
              >{i}</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
