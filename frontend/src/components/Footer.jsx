import { Link } from 'react-router-dom';
import { ShoppingBag, Github, Twitter, Mail } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { useDark } from '../hooks/useDark';

export default function Footer() {
  const dark = useDark();
  const surface = dark ? '#0a0f1e' : '#fff';
  const border = dark ? '#141929' : '#e8edf5';
  const textMain = dark ? '#f0f4ff' : '#0a0f1e';
  const textMuted = dark ? '#475569' : '#94a3b8';
  const soft = dark ? '#0f1628' : '#f0f4ff';

  return (
    <footer style={{ background: surface, borderTop: `1px solid ${border}`, marginTop: 80 }}>
      <div className="page-container" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                <ShoppingBag size={16} color="#fff" />
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: textMain }}>
                Camps<span style={{ color: '#2563eb' }}>Mart</span>
              </span>
            </Link>
            <p style={{ color: textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              The trusted marketplace for university students to buy, sell & exchange on campus.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ icon: Github, href: '#' }, { icon: Twitter, href: '#' }, { icon: Mail, href: 'mailto:hello@campusmart.app' }].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} style={{
                  width: 32, height: 32, borderRadius: 10, background: soft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: textMuted, textDecoration: 'none', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(37,99,235,0.15)' : '#dbeafe'; e.currentTarget.style.color = '#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = soft; e.currentTarget.style.color = textMuted; }}
                ><Icon size={14} /></a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: textMain, marginBottom: 16 }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORIES.slice(0, 5).map(cat => (
                <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`} style={{ fontSize: 13, color: textMuted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >
                  <span>{CATEGORY_ICONS[cat]}</span> {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: textMain, marginBottom: 16 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/', label: 'Browse All' },
                { to: '/add-item', label: 'Sell an Item' },
                { to: '/categories', label: 'All Categories' },
                { to: '/profile', label: 'My Profile' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} style={{ fontSize: 13, color: textMuted, textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.color = textMuted}
                >{label}</Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: textMain, marginBottom: 16 }}>Start Selling</h4>
            <p style={{ color: textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Got something to sell? List it for free and reach thousands of students.
            </p>
            <Link to="/add-item" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Post an Item</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ paddingTop: 24, borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: textMuted }}>© {new Date().getFullYear()} CampsMart. All rights reserved.</p>
          <p style={{ fontSize: 12, color: textMuted }}>Made with ❤️ for students</p>
        </div>
      </div>
    </footer>
  );
}
