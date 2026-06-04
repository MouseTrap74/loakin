import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <style>{`
        /* ── FOOTER ── */
        .lb-footer-wrap { background: #fff; border-top: 1px solid #e8edf0; margin-top: auto; padding: 4rem 0 1.5rem; font-family: 'Nunito', sans-serif; text-align: left; }
        .lb-footer-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; flex-direction: column; gap: 3rem; }
        .lb-footer-top { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem; }
        .lb-footer-col { display: flex; flex-direction: column; gap: 1.2rem; min-width: 160px; }
        .lb-footer-col:not(.brand) { padding-left: 2rem; border-left: 1px solid #e8edf0; }
        .lb-footer-col.brand { max-width: 280px; }
        .lb-footer-brand { font-size: 32px; font-weight: 900; color: #111; margin: 0; letter-spacing: -0.5px; }
        .lb-footer-desc { font-size: 13px; color: #555; line-height: 1.5; margin: 0; font-weight: 600; }
        .lb-footer-features { display: flex; flex-direction: column; gap: 14px; margin-top: 10px; }
        .lb-footer-feat { display: flex; align-items: center; gap: 12px; }
        .lb-footer-feat-icon { width: 38px; height: 38px; background: #c2eef2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #3BBFC9; flex-shrink: 0; }
        .lb-footer-feat-text h4 { font-size: 11.5px; font-weight: 800; color: #111; margin: 0 0 2px; }
        .lb-footer-feat-text p { font-size: 9.5px; color: #777; margin: 0; font-weight: 600; }
        
        .lb-footer-heading { font-size: 14px; font-weight: 800; color: #111; margin: 0 0 8px; }
        .lb-footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .lb-footer-links a { text-decoration: none; color: #9aa7b8; font-size: 13.5px; font-weight: 600; transition: color 0.15s; }
        .lb-footer-links a:hover { color: #3BBFC9; }
        
        .lb-footer-social { display: flex; flex-direction: column; gap: 14px; }
        .lb-footer-social a { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #9aa7b8; font-size: 13.5px; font-weight: 600; transition: color 0.15s; }
        .lb-footer-social a:hover { color: #3BBFC9; }
        
        .lb-footer-contact { display: flex; flex-direction: column; gap: 14px; }
        .lb-footer-contact p { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #9aa7b8; margin: 0; font-weight: 600; }
        
        .lb-footer-bottom { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 2rem; border-top: 1px solid #f0f2f5; flex-wrap: wrap; gap: 1rem; }
        .lb-footer-copy { font-size: 12px; color: #a0aec0; font-weight: 600; margin: 0; }
        .lb-footer-payment { display: flex; flex-direction: column; gap: 8px; border-left: 2px solid #eaeef2; padding-left: 1rem; }
        .lb-footer-payment-title { font-size: 11px; color: #a0aec0; font-weight: 600; margin: 0; }
        .lb-footer-payment-logos { display: flex; align-items: center; gap: 16px; font-size: 18px; font-weight: 900; font-style: italic; color: #004b87; }
        
        @media (max-width: 768px) {
          .lb-footer-col:not(.brand) { padding-left: 0; border-left: none; }
        }
      `}</style>
      <footer className="lb-footer-wrap">
        <div className="lb-footer-container">
          <div className="lb-footer-top">
            
            {/* Col 1: Brand & Features */}
            <div className="lb-footer-col brand">
              <h2 className="lb-footer-brand">Loakin</h2>
              <p className="lb-footer-desc">
                Platform jual beli barang bekas berkualitas dengan harga terjangkau.
              </p>
              <div className="lb-footer-features">
                <div className="lb-footer-feat">
                  <div className="lb-footer-feat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                  </div>
                  <div className="lb-footer-feat-text">
                    <h4>Aman & Terpercaya</h4>
                    <p>Transaksi aman, barang berkualitas</p>
                  </div>
                </div>
                <div className="lb-footer-feat">
                  <div className="lb-footer-feat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  <div className="lb-footer-feat-text">
                    <h4>Customer Support</h4>
                    <p>Kami Membantu 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Tautan Cepat */}
            <div className="lb-footer-col">
              <h4 className="lb-footer-heading">Tautan Cepat</h4>
              <ul className="lb-footer-links">
                <li><Link to="/">Beranda</Link></li>
                <li><Link to="/categories">Kategori</Link></li>
                <li><Link to="/flash-sale">Flash Sale</Link></li>
                <li><Link to="/">Semua Produk</Link></li>
                <li><Link to="/listings/create">Jual di Loakin</Link></li>
                <li><Link to="/how-to-buy">Cara Belanja</Link></li>
                <li><Link to="/my-listings">Cek Pesanan</Link></li>
              </ul>
            </div>

            {/* Col 3: Layanan */}
            <div className="lb-footer-col">
              <h4 className="lb-footer-heading">Layanan</h4>
              <ul className="lb-footer-links">
                <li><Link to="/help">Bantuan</Link></li>
                <li><Link to="/payment">Metode Pembayaran</Link></li>
                <li><Link to="/shipping">Pengiriman</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/terms">Syarat & Ketentuan</Link></li>
                <li><Link to="/privacy">Kebijakan Privasi</Link></li>
              </ul>
            </div>

            {/* Col 4: Ikuti Kami */}
            <div className="lb-footer-col">
              <h4 className="lb-footer-heading">Ikuti Kami</h4>
              <div className="lb-footer-social">
                {/* TODO: replace with real social URLs */}
                <a href="#">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  Instagram
                </a>
                <a href="#">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  Facebook
                </a>
                <a href="#">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                  X
                </a>
              </div>
            </div>

            {/* Col 5: Contact */}
            <div className="lb-footer-col">
              <h4 className="lb-footer-heading">Contact</h4>
              <div className="lb-footer-contact">
                <p>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Bandung, Indonesia
                </p>
                <p>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Contact@loakin.com
                </p>
              </div>
            </div>
          </div>

          <div className="lb-footer-bottom">
            <p className="lb-footer-copy">© 2026, PT. Loakin Indonesia. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
