import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';
import blobImg  from '../../assets/LoakinLogo-Blob.png';
import boxImg   from '../../assets/box.png';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/reset-password', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset kata sandi');
    } finally {
      setLoading(false);
    }
  };

  const isReady = form.email && form.password && form.password_confirmation;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rp-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f4f6f8;
          font-family: 'Nunito', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 2rem 1rem 4rem;
        }

        .rp-blob {
          position: absolute;
          width: 700px;
          height: 700px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -45%) rotate(45deg);
          z-index: 0;
          pointer-events: none;
          object-fit: contain;
        }

        /* ── floating boxes ── */
        .rp-box-left {
          position: absolute;
          left: calc(50% - 370px);
          top: calc(50% - 150px);
          width: 175px;
          transform: rotate(-12deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(6px 10px 14px rgba(0,0,0,0.2));
          animation: rp-float-l 4.5s ease-in-out infinite;
        }
        .rp-box-right {
          position: absolute;
          right: calc(50% - 365px);
          top: calc(50% + 55px);
          width: 130px;
          transform: rotate(14deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(4px 8px 10px rgba(0,0,0,0.18));
          animation: rp-float-r 4.5s ease-in-out infinite;
        }
        @keyframes rp-float-l {
          0%, 100% { transform: rotate(-12deg) translateY(0px);   }
          50%       { transform: rotate(-12deg) translateY(-12px); }
        }
        @keyframes rp-float-r {
          0%, 100% { transform: rotate(14deg) translateY(-12px);  }
          50%       { transform: rotate(14deg) translateY(0px);    }
        }

        /* ── card ── */
        .rp-card {
          position: relative;
          z-index: 3;
          background: #fff;
          border-radius: 20px;
          padding: 2rem 2.2rem 2.2rem;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.10);
          animation: rp-fadein 0.45s ease 0.1s both;
        }
        @keyframes rp-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .rp-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 0.4rem;
          letter-spacing: -0.3px;
        }
        .rp-subtitle {
          color: #a0aab4;
          font-size: 0.87rem;
          line-height: 1.55;
          margin-bottom: 1.4rem;
        }

        /* ── input ── */
        .rp-input {
          width: 100%;
          padding: 0.78rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: 'Nunito', sans-serif;
          color: #333;
          outline: none;
          background: #fafbfc;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 0.5rem;
        }
        .rp-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .rp-input::placeholder { color: #b0bec5; }

        .rp-error   { color: #e53e3e; font-size: 0.82rem; margin-bottom: 0.5rem; }
        .rp-success {
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
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        /* ── primary button ── */
        .rp-btn {
          width: 100%;
          padding: 0.78rem;
          border: none;
          border-radius: 10px;
          font-size: 0.97rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 1.1rem;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
          background: #e4f3f5;
          color: #8dcdd3;
        }
        .rp-btn.ready {
          background: #3BBFC9;
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,191,201,0.32);
        }
        .rp-btn.ready:hover  { background: #2aadb8; transform: translateY(-1px); }
        .rp-btn.ready:active { transform: translateY(0); }
        .rp-btn:disabled     { opacity: 0.7; cursor: not-allowed; }

        /* ── back link ── */
        .rp-back {
          text-align: center;
        }
        .rp-back a {
          color: #3BBFC9;
          font-size: 0.87rem;
          font-weight: 700;
          text-decoration: none;
        }
        .rp-back a:hover { text-decoration: underline; }

        /* ── footer ── */
        .rp-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          z-index: 3;
          border-top: 1px solid #e8edf0;
          padding: 0.85rem 0;
          background: #f4f6f8;
        }

        @media (max-width: 640px) {
          .rp-blob      { width: 440px; height: 440px; }
          .rp-box-left  { display: none; }
          .rp-box-right { display: none; }
        }
      `}</style>

      <div className="rp-page">
        <img src={blobImg} alt="" className="rp-blob"      aria-hidden="true" />
        <img src={boxImg}  alt="" className="rp-box-left"  aria-hidden="true" />
        <img src={boxImg}  alt="" className="rp-box-right" aria-hidden="true" />

        <div className="rp-card">
          <h2 className="rp-title">Reset Kata Sandi</h2>
          <p className="rp-subtitle">
            Masukkan email dan kata sandi baru kamu.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              className="rp-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            <input
              className="rp-input"
              type="password"
              placeholder="Kata Sandi Baru"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <input
              className="rp-input"
              type="password"
              placeholder="Konfirmasi Kata Sandi Baru"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            />

            {error   && <p className="rp-error">{error}</p>}
            {success && (
              <div className="rp-success">
                <span>✓</span>
                <span>{success} Mengalihkan ke login...</span>
              </div>
            )}

            <button
              className={`rp-btn${isReady ? ' ready' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Reset Kata Sandi'}
            </button>
          </form>

          <div className="rp-back">
            <Link to="/login">← Kembali ke Login</Link>
          </div>
        </div>

        <footer className="rp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}