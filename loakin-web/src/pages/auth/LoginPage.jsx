import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import logoText from '../../assets/LoakinLogoText.png';
import blobImg  from '../../assets/LoakinLogo-Blob.png';
import boxImg   from '../../assets/box.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]     = useState({ login: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin   = () => { /* TODO: window.location.href = '/auth/google'   */ };
  const handleFacebookLogin = () => { /* TODO: window.location.href = '/auth/facebook' */ };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lk-page {
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

        .lk-blob {
          position: absolute;
          width: 700px;
          height: 700px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -52%) rotate(12deg);
          z-index: 0;
          pointer-events: none;
          object-fit: contain;
          opacity: 1;
          mix-blend-mode: normal;
        }

        .lk-box-left {
          position: absolute;
          left: calc(50% - 370px);
          top: calc(50% - 150px);
          width: 175px;
          transform: rotate(-12deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(6px 10px 14px rgba(0,0,0,0.2));
          animation: lk-float-l 4.5s ease-in-out infinite;
        }
        .lk-box-right {
          position: absolute;
          right: calc(50% - 365px);
          top: calc(50% + 55px);
          width: 130px;
          transform: rotate(14deg);
          z-index: 4;
          pointer-events: none;
          filter: drop-shadow(4px 8px 10px rgba(0,0,0,0.18));
          animation: lk-float-r 4.5s ease-in-out infinite;
        }
        @keyframes lk-float-l {
          0%, 100% { transform: rotate(-12deg) translateY(0px);   }
          50%       { transform: rotate(-12deg) translateY(-12px); }
        }
        @keyframes lk-float-r {
          0%, 100% { transform: rotate(14deg) translateY(-12px);  }
          50%       { transform: rotate(14deg) translateY(0px);    }
        }

        .lk-logo {
          position: relative;
          z-index: 3;
          margin-bottom: 1.4rem;
          animation: lk-fadein 0.45s ease both;
        }
        .lk-logo img {
          height: 40px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .lk-card {
          position: relative;
          z-index: 3;
          background: #fff;
          border-radius: 20px;
          padding: 2rem 2.2rem 2.2rem;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 12px 48px rgba(0,0,0,0.10);
          animation: lk-fadein 0.45s ease 0.1s both;
        }
        @keyframes lk-fadein {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .lk-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 2px;
          letter-spacing: -0.3px;
        }
        .lk-register-link {
          color: #3BBFC9;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 1.4rem;
        }
        .lk-register-link:hover { text-decoration: underline; }

        .lk-input {
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
        .lk-input + .lk-input { margin-top: 0.6rem; }
        .lk-input:focus {
          border-color: #3BBFC9;
          box-shadow: 0 0 0 3px rgba(59,191,201,0.15);
          background: #fff;
        }
        .lk-input::placeholder { color: #b0bec5; }

        .lk-hint  { color: #b0bec5; font-size: 0.77rem; margin-top: 0.3rem; }
        .lk-error { color: #e53e3e; font-size: 0.82rem; margin-top: 0.4rem; }

        .lk-row-right {
          display: flex;
          justify-content: flex-end;
          margin: 0.6rem 0 0.75rem;
        }
        .lk-help-link {
          color: #3BBFC9;
          font-size: 0.84rem;
          font-weight: 700;
          text-decoration: none;
        }
        .lk-help-link:hover { text-decoration: underline; }

        .lk-btn {
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
        .lk-btn.ready {
          background: #3BBFC9;
          color: #fff;
          box-shadow: 0 4px 16px rgba(59,191,201,0.32);
        }
        .lk-btn.ready:hover  { background: #2aadb8; transform: translateY(-1px); }
        .lk-btn.ready:active { transform: translateY(0); }
        .lk-btn:disabled     { opacity: 0.7; cursor: not-allowed; }

        .lk-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #c5d0d8;
          font-size: 0.8rem;
          margin-bottom: 1.1rem;
        }
        .lk-divider::before,
        .lk-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8edf0;
        }

        .lk-social {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0.72rem;
          border: 1.5px solid #e8edf0;
          border-radius: 10px;
          background: #fff;
          font-size: 0.93rem;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          color: #333;
          cursor: pointer;
          margin-bottom: 0.6rem;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .lk-social:last-of-type { margin-bottom: 0; }
        .lk-social:hover {
          border-color: #3BBFC9;
          box-shadow: 0 2px 10px rgba(59,191,201,0.12);
          transform: translateY(-1px);
        }
        .lk-social:active { transform: translateY(0); }

        .lk-footer {
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
          .lk-blob { width: 440px; height: 440px; }
          .lk-box-left  { display: none; }
          .lk-box-right { display: none; }
        }
      `}</style>

      <div className="lk-page">
        <img src={blobImg} alt="" className="lk-blob" aria-hidden="true" />
        <img src={boxImg} alt="" className="lk-box-left" aria-hidden="true" />
        <img src={boxImg} alt="" className="lk-box-right" aria-hidden="true" />

        <div className="lk-logo">
          <img src={logoText} alt="Loakin" />
        </div>

        <div className="lk-card">
          <h2 className="lk-title">Masuk Loakin</h2>
          <Link to="/register" className="lk-register-link">Daftar</Link>

          <form onSubmit={handleSubmit}>
            <input
              className="lk-input"
              type="text"
              placeholder="Email"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              autoComplete="username"
            />
            <p className="lk-hint">Contoh : email@loakin.com</p>

            <input
              className="lk-input"
              type="password"
              placeholder="Kata Sandi"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />

            {error && <p className="lk-error">{error}</p>}

            <div className="lk-row-right">
              <Link to="/forgot-password" className="lk-help-link">Bantuan</Link>
            </div>

            <button
              className={`lk-btn${form.login && form.password ? ' ready' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="lk-divider">atau masuk dengan</div>

          <button className="lk-social" onClick={handleGoogleLogin} type="button">
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6C12.3 13 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
              <path fill="#FBBC05" d="M10.5 28.7A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.8 6C6.7 42.6 14.7 48 24 48z"/>
            </svg>
            Google
          </button>

          <button className="lk-social" onClick={handleFacebookLogin} type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <footer className="lk-footer">
          © 2026, PT. Loakin Indonesia. All Rights Reserved.
        </footer>
      </div>
    </>
  );
}