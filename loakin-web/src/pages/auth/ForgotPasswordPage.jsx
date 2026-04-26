import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';
import blobImg  from '../../assets/LoakinLogo-Blob.png';
import boxImg   from '../../assets/box.png';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/forgot-password', { email });
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim link reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-page {
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

        .fp-blob {
          position: absolute;
          width: 700px;
          height: 700px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -52%) rotate(12deg);
          z-index: 0;
          pointer-events: none;
          object-fit: contain;
        }

        /* ── floating boxes ── */
        .fp-box-left {
          position: absolute;
          left: calc(50% - 370px);
          top: calc(50% - 150px);
          width: 175px;
          transform: rotate(-12deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(6px 10px 14px rgba(0,0,0,0.2));
          animation: fp-float-l 4.5s ease-in-out infinite;
        }
        .fp-box-right {
          position: absolute;
          right: calc(50% - 365px);
          top: calc(50% + 55px);
          width: 130px;
          transform: rotate(14deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(4px 8px 10px rgba(0,0,0,0.18));
          animation: fp-float-r 4.5s ease-in-out infinite;
        }
        @keyframes fp-float-l {
          0%, 100% { transform: rotate(-12deg) translateY(0px);   }
          50%       { transform: rotate(-12deg) translateY(-12px); }
        }
        @keyframes fp-float-r {
          0%, 100% { transform: rotate(14deg) translateY(-12px);  }
          50%       { transform: rotate(14deg) translateY(0px);    }
        }

        /* ── logo ── */
        .fp-logo {
          position: relative;
          z-index: 3;
          margin-bottom: 1.4rem;
          animation: fp-fadein 0.45s ease both;
        }
        .fp-logo img {
          height: 40px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* ── card ── */
        .fp-card {
          position: relative;
          z-index: 3;
          background: #fff;
          border-radius: 20px;
          padding: 2rem 2.2rem 2.2rem;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.10);
          animation: fp-fadein 0.45s ease 0.1s both;
        }
        @keyframes fp-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .fp-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 0.4rem;
          letter-spacing: -0.3px;
        }
        .fp-subtitle {
          color: #a0aab4;
          font-size: 0.87rem;
          line-height: 1.55;
          margin-bottom: 1.4rem;
        }

        /* ── input ── */
        .fp-input {
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
        .fp-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .fp-input::placeholder { color: #b0bec5; }

        .fp-error   { color: #e53e3e; font-size: 0.82rem; margin-bottom: 0.5rem; }
        .fp-success {
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
        .fp-btn {
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
        .fp-btn.ready {
          background: #3BBFC9;
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,191,201,0.32);
        }
        .fp-btn.ready:hover  { background: #2aadb8; transform: translateY(-1px); }
        .fp-btn.ready:active { transform: translateY(0); }
        .fp-btn:disabled     { opacity: 0.7; cursor: not-allowed; }

        /* ── back link ── */
        .fp-back {
          text-align: center;
        }
        .fp-back a {
          color: #3BBFC9;
          font-size: 0.87rem;
          font-weight: 700;
          text-decoration: none;
        }
        .fp-back a:hover { text-decoration: underline; }

        /* ── footer ── */
        .fp-footer {
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
          .fp-blob      { width: 440px; height: 440px; }
          .fp-box-left  { display: none; }
          .fp-box-right { display: none; }
        }
      `}</style>

      <div className="fp-page">
        <img src={blobImg} alt="" className="fp-blob"      aria-hidden="true" />
        <img src={boxImg}  alt="" className="fp-box-left"  aria-hidden="true" />
        <img src={boxImg}  alt="" className="fp-box-right" aria-hidden="true" />

        <div className="fp-card">
          <h2 className="fp-title">Lupa Kata Sandi</h2>
          <p className="fp-subtitle">
            Masukkan email kamu dan kami akan mengirimkan link untuk reset kata sandi.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              className="fp-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {error   && <p className="fp-error">{error}</p>}
            {success && (
              <div className="fp-success">
                <span>✓</span>
                <span>{success}</span>
              </div>
            )}

            <button
              className={`fp-btn${email ? ' ready' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>

          <div className="fp-back">
            <Link to="/login">← Kembali ke Login</Link>
          </div>
        </div>

        <footer className="fp-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}