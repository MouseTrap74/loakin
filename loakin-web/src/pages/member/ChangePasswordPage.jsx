import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import UtilityBar from '../../components/UtilityBar';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/profile/change-password', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengganti kata sandi');
    } finally {
      setLoading(false);
    }
  };

  const isReady = form.current_password && form.password && form.password_confirmation;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-page {
          min-height: 100vh;
          background: #f0f2f5;
          display: flex;
          flex-direction: column;
          font-family: 'Nunito', sans-serif;
        }


        /* ── container ── */
        .cp-container {
          flex: 1;
          display: flex;
          justify-content: center;
          padding: 2.5rem 1.5rem 2rem;
        }

        /* ── card ── */
        .cp-card {
          background: #fff;
          border-radius: 20px;
          padding: 2rem 2.2rem 2.2rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          height: fit-content;
          animation: cp-fadein 0.45s ease both;
        }
        @keyframes cp-fadein {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .cp-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 1.6rem;
          letter-spacing: -0.3px;
        }

        /* ── fields ── */
        .cp-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 800;
          color: #6b7a8d;
          margin-bottom: 0.4rem;
        }
        .cp-input {
          width: 100%;
          padding: 0.78rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #fafbfc;
          margin-bottom: 1.1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cp-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .cp-input::placeholder { color: #b0bec5; }

        /* ── feedback ── */
        .cp-error {
          color: #e53e3e;
          font-size: 0.82rem;
          margin-bottom: 0.75rem;
        }
        .cp-success {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #edfaf5;
          border: 1.5px solid #6fcfb0;
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          color: #1a7a55;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        /* ── button ── */
        .cp-btn {
          width: 100%;
          padding: 0.78rem;
          border: none;
          border-radius: 10px;
          font-size: 0.97rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
          background: #e4f3f5;
          color: #8dcdd3;
        }
        .cp-btn.ready {
          background: #3BBFC9;
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,191,201,0.32);
        }
        .cp-btn.ready:hover  { background: #2aadb8; transform: translateY(-1px); }
        .cp-btn.ready:active { transform: translateY(0); }
        .cp-btn:disabled     { opacity: 0.7; cursor: not-allowed; }

        /* ── footer ── */
        .cp-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          padding: 1.2rem 0;
          border-top: 1px solid #e8edf0;
          background: #fff;
        }
      `}</style>

      <div className="cp-page">
        <UtilityBar />
        <Navbar />

        {/* Content */}
        <div className="cp-container">
          <div className="cp-card">
            <h2 className="cp-title">Ganti Kata Sandi</h2>

            <form onSubmit={handleSubmit}>
              <label className="cp-label">Kata Sandi Lama</label>
              <input
                className="cp-input"
                type="password"
                placeholder="Masukkan kata sandi lama"
                value={form.current_password}
                onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                autoComplete="current-password"
              />

              <label className="cp-label">Kata Sandi Baru</label>
              <input
                className="cp-input"
                type="password"
                placeholder="Masukkan kata sandi baru"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />

              <label className="cp-label">Konfirmasi Kata Sandi Baru</label>
              <input
                className="cp-input"
                type="password"
                placeholder="Konfirmasi kata sandi baru"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                autoComplete="new-password"
              />

              {error   && <p className="cp-error">{error}</p>}
              {success && (
                <div className="cp-success">
                  <span>✓</span>
                  <span>{success}</span>
                </div>
              )}

              <button
                className={`cp-btn${isReady ? ' ready' : ''}`}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>

        <footer className="cp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}