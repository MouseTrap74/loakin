import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';
import blobImg  from '../../assets/LoakinLogo-Blob.png';
import boxImg   from '../../assets/box.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/register', form);
      login(res.data.user, res.data.token);
      navigate('/profile');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const first = Object.values(errors)[0][0];
        setError(first);
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  const isReady =
    form.name && form.email && form.phone &&
    form.password && form.password_confirmation;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rk-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #f4f6f8;
          font-family: 'Nunito', sans-serif;
          overflow: hidden;
        }

        /* ── top bar (logo) ── */
        .rk-topbar {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.4rem 2.5rem;
          position: relative;
          z-index: 5;
        }

        /* ── two-column main ── */
        .rk-main {
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 4vw 3.5rem;
          gap: 0;
        }

        /* ── left: blob + boxes ── */
        .rk-left {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 520px;
        }

        .rk-blob {
          width: min(520px, 46vw);
          height: min(520px, 46vw);
          object-fit: contain;
          pointer-events: none;
          user-select: none;
          position: relative;
          z-index: 1;
        }

        /* ── floating boxes ── */
        .rk-box-left {
          position: absolute;
          left: 14%;
          top: 10%;
          width: clamp(110px, 14vw, 160px);
          transform: rotate(-12deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(6px 10px 14px rgba(0,0,0,0.2));
          animation: rk-float-l 4.5s ease-in-out infinite;
        }
        .rk-box-right {
          position: absolute;
          right: 14%;
          bottom: 10%;
          width: clamp(85px, 10vw, 118px);
          transform: rotate(14deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(4px 8px 10px rgba(0,0,0,0.18));
          animation: rk-float-r 4.5s ease-in-out infinite;
        }
        @keyframes rk-float-l {
          0%, 100% { transform: rotate(-12deg) translateY(0px);   }
          50%       { transform: rotate(-12deg) translateY(-12px); }
        }
        @keyframes rk-float-r {
          0%, 100% { transform: rotate(14deg) translateY(-12px);  }
          50%       { transform: rotate(14deg) translateY(0px);    }
        }

        /* ── right: card ── */
        .rk-right {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 3vw;
        }

        /* ── logo ── */
        .rk-logo img {
          height: 38px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        /* ── card ── */
        .rk-card {
          position: relative;
          z-index: 3;
          background: #fff;
          border-radius: 20px;
          padding: 2rem 2.2rem 2.2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.10);
          animation: rk-fadein 0.45s ease 0.1s both;
        }
        @keyframes rk-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .rk-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 2px;
          letter-spacing: -0.3px;
        }
        .rk-login-link {
          color: #3BBFC9;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1.2rem;
        }
        .rk-login-link:hover { text-decoration: underline; }

        /* ── inputs ── */
        .rk-input {
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
        }
        .rk-input + .rk-input { margin-top: 0.55rem; }
        .rk-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .rk-input::placeholder { color: #b0bec5; }

        .rk-hint  { color: #b0bec5; font-size: 0.77rem; margin-top: 0.3rem; margin-bottom: 0.25rem; }
        .rk-error { color: #e53e3e; font-size: 0.82rem; margin-top: 0.4rem; }

        .rk-row-right {
          display: flex;
          justify-content: flex-end;
          margin: 0.55rem 0 0.7rem;
        }
        .rk-help-link {
          color: #3BBFC9;
          font-size: 0.84rem;
          font-weight: 700;
          text-decoration: none;
        }
        .rk-help-link:hover { text-decoration: underline; }

        /* ── primary button ── */
        .rk-btn {
          width: 100%;
          padding: 0.78rem;
          border: none;
          border-radius: 10px;
          font-size: 0.97rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 1rem;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
          background: #e4f3f5;
          color: #8dcdd3;
        }
        .rk-btn.ready {
          background: #3BBFC9;
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,191,201,0.32);
        }
        .rk-btn.ready:hover  { background: #2aadb8; transform: translateY(-1px); }
        .rk-btn.ready:active { transform: translateY(0); }
        .rk-btn:disabled     { opacity: 0.7; cursor: not-allowed; }

        /* ── divider ── */
        .rk-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #c5d0d8;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }
        .rk-divider::before,
        .rk-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8edf0;
        }

        /* ── social buttons ── */
        .rk-social {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0.68rem;
          border: 1.5px solid #e8edf0;
          border-radius: 10px;
          background: #fff;
          font-size: 0.93rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          color: #333;
          cursor: pointer;
          margin-bottom: 0.55rem;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .rk-social:last-of-type { margin-bottom: 0; }
        .rk-social:hover {
          border-color: #3BBFC9;
          box-shadow: 0 2px 10px rgba(59,191,201,0.12);
          transform: translateY(-1px);
        }
        .rk-social:active { transform: translateY(0); }

        /* ── footer ── */
        .rk-footer {
          text-align: center;
          color: #b0bec5;
          font-size: 0.77rem;
          z-index: 3;
          border-top: 1px solid #e8edf0;
          padding: 0.9rem 0;
          background: #f4f6f8;
        }

        /* ── responsive ── */
        @media (max-width: 860px) {
          .rk-main       { flex-direction: column; padding: 1rem 1.5rem 3rem; gap: 1rem; }
          .rk-left       { min-height: 260px; width: 100%; }
          .rk-blob       { width: 280px; height: 280px; }
          .rk-right      { width: 100%; justify-content: center; padding-right: 0; }
          .rk-card       { max-width: 100%; }
        }
        @media (max-width: 480px) {
          .rk-topbar     { padding: 1rem 1.2rem; }
          .rk-box-left   { display: none; }
          .rk-box-right  { display: none; }
        }
      `}</style>

      <div className="rk-page">

        {/* Top bar — logo */}
        <div className="rk-topbar">
          <div className="rk-logo">
            <img src={logoText} alt="Loakin" />
          </div>
        </div>

        {/* Two-column main */}
        <div className="rk-main">

          {/* Left — blob + floating boxes */}
          <div className="rk-left">
            <img src={blobImg} alt="" className="rk-blob" aria-hidden="true" />
            <img src={boxImg}  alt="" className="rk-box-left"  aria-hidden="true" />
            <img src={boxImg}  alt="" className="rk-box-right" aria-hidden="true" />
          </div>

          {/* Right — card */}
          <div className="rk-right">
            <div className="rk-card">
          <h2 className="rk-title">Daftar Loakin</h2>
          <Link to="/login" className="rk-login-link">Sudah punya akun?</Link>

          <form onSubmit={handleSubmit}>
            <input
              className="rk-input"
              type="text"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
            <input
              className="rk-input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            <p className="rk-hint">Contoh : email@loakin.com</p>
            <input
              className="rk-input"
              type="text"
              placeholder="Nomor HP"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              autoComplete="tel"
            />
            <input
              className="rk-input"
              type="password"
              placeholder="Kata Sandi"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            <input
              className="rk-input"
              type="password"
              placeholder="Konfirmasi Kata Sandi"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              autoComplete="new-password"
            />

            {error && <p className="rk-error">{error}</p>}

            <div className="rk-row-right">
              <Link to="/forgot-password" className="rk-help-link">Bantuan</Link>
            </div>

            <button
              className={`rk-btn${isReady ? ' ready' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <div className="rk-divider">atau daftar dengan</div>

          {/* Google */}
          <button className="rk-social" type="button">
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6C12.3 13 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
              <path fill="#FBBC05" d="M10.5 28.7A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.8 6C6.7 42.6 14.7 48 24 48z"/>
            </svg>
            Google
          </button>

          {/* Facebook */}
          <button className="rk-social" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            Facebook
          </button>
          </div>{/* rk-card */}
          </div>{/* rk-right */}
        </div>{/* rk-main */}

        <footer className="rk-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}