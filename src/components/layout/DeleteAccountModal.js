import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import './DeleteAccountModal.css';

export default function DeleteAccountModal({ onClose }) {
  const { currentUser, removeAccount } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const isDoctor = currentUser.role === 'doctor';

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password to confirm account deletion.');
      return;
    }

    setLoading(true);
    try {
      await removeAccount(password);
      setLoading(false);
      onClose();
      navigate('/login', { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to delete account. Please check your credentials.');
    }
  };

  return (
    <div className="delete-modal-overlay" onClick={onClose}>
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3>Delete {isDoctor ? 'Practitioner' : 'Patient'} Account</h3>
            <p>Permanent & Irreversible Database Action</p>
          </div>
        </div>

        <form onSubmit={handleDelete} className="delete-modal-body">
          <p className="delete-warning-text">
            Are you sure you want to permanently delete your account for{' '}
            <strong>{currentUser.fullName}</strong> ({currentUser.email})? All your consultations,
            profile details, and schedule records in SQLite will be erased permanently.
          </p>

          {error && (
            <div className="auth-error-alert" style={{ margin: 0 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="delete-confirm-password" style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0f172a' }}>
              Confirm your account password:
            </label>
            <input
              id="delete-confirm-password"
              type="password"
              className="input-field"
              style={{ paddingLeft: '14px', borderColor: '#fca5a5' }}
              placeholder="Enter current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="delete-modal-actions">
            <button
              type="button"
              className="action-btn-sm"
              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="delete-confirm-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              disabled={loading}
            >
              <FaTrashAlt />
              {loading ? 'Deleting Records...' : 'Permanently Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

