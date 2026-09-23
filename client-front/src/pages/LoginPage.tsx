import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Waves, Lock, Mail, ArrowRight, TicketCheck, FolderCheck, CreditCard,
  User, Phone, Building2, ChevronLeft, CheckCircle2, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../services/api';
import { Logo } from '../components/Logo';

const Feature: React.FC<{ icon: React.ElementType; label: string; sub: string }> = ({ icon: Icon, label, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon style={{ width: '20px', color: 'white' }} />
    </div>
    <div>
      <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{sub}</p>
    </div>
  </div>
);

export const LoginPage: React.FC = () => {
  const { login, register, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Forgot
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const switchView = (v: 'login' | 'register' | 'forgot') => {
    setView(v);
    setError('');
    setRegError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      await register({ name: regName, email: regEmail, password: regPassword, companyName: regCompany, contactPhone: regPhone });
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try { await apiClient.post('/auth/forgot-password', { email: forgotEmail }); } catch { /* intentional */ }
    finally { setForgotLoading(false); setForgotSent(true); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg-body)' }}>

      {/* LEFT: Branded gradient panel */}
      <div className="hidden lg:flex" style={{
        width: '45%', flexShrink: 0,
        background: 'linear-gradient(145deg, #35B5B1 0%, #4ECDC4 45%, #7B5EA7 100%)',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo variant="hero" subtitle="Portal" size="lg" />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '38px', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Your Creative<br />Project Hub
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 40px', lineHeight: '1.6' }}>
            Track your design requests, review deliverables, and manage your marketing retainer — in real time.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Feature icon={TicketCheck} label="Request Tracking" sub="Submit & monitor every creative request" />
            <Feature icon={FolderCheck} label="Deliverables Vault" sub="Preview and download your assets" />
            <Feature icon={CreditCard} label="Plan & Invoices" sub="Manage your subscription & billing" />
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '18px 22px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '0 0 10px', fontStyle: 'italic', lineHeight: '1.5' }}>
            "The client portal gives us full visibility on every project. We love the transparency."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80"
              alt="Nour Ahmed"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
            />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: 0 }}>Nour Ahmed</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Marketing Manager, Acme Corp</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Logo subtitle="Portal" size="md" />
          </div>

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  Access your markPocket client workspace
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '7px' }}>
                    {t('email')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-light"
                      style={{ paddingLeft: '40px' }}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)' }}>
                      {t('password')}
                    </label>
                    <button type="button" onClick={() => switchView('forgot')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--brand)', fontFamily: 'Outfit, sans-serif', padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-light"
                      style={{ paddingLeft: '40px' }}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <p style={{ fontSize: '13px', color: 'var(--red)', margin: 0, background: 'var(--red-alpha)', padding: '10px 14px', borderRadius: '10px' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-brand"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px', marginTop: '4px' }}
                >
                  {authLoading ? t('loading') : t('login')}
                  <ArrowRight style={{ width: '16px' }} />
                </button>
              </form>

              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(53, 181, 177, 0.08)', borderRadius: '14px', border: '1px dashed var(--brand)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-dark)', margin: 0, lineHeight: '1.5', fontWeight: 700 }}>
                  Need client portal access?
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: '1.4' }}>
                  Client accounts are created and managed directly by your Marketing Agency manager. Please contact your agency representative to receive your account credentials.
                </p>
              </div>

              <div style={{ marginTop: '24px', padding: '18px', background: 'white', borderRadius: '14px', boxShadow: 'var(--shadow-xs)', border: '1.5px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quick Demo Login
                </p>
                <button
                  onClick={() => { setEmail('client@acme.com'); setPassword('ClientSecret123'); }}
                  style={{
                    background: 'var(--brand-alpha)', color: 'var(--brand-dark)', border: 'none',
                    borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  Acme Corp Client
                </button>
              </div>
            </>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <>
              <button type="button" onClick={() => switchView('login')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontWeight: 700, fontSize: '13px', fontFamily: 'Outfit, sans-serif', padding: 0, marginBottom: '24px' }}>
                <ChevronLeft style={{ width: '15px' }} />
                Back to sign in
              </button>

              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Create client account
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  Set up your client access in seconds
                </p>
              </div>

              {regError && (
                <p style={{ fontSize: '13px', color: 'var(--red)', background: 'var(--red-alpha)', padding: '10px 14px', borderRadius: '10px', margin: '0 0 16px' }}>
                  {regError}
                </p>
              )}

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="input-light" style={{ paddingLeft: '40px' }} placeholder="John Doe" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className="input-light" style={{ paddingLeft: '40px' }} placeholder="you@company.com" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Company Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="text" required value={regCompany} onChange={e => setRegCompany(e.target.value)} className="input-light" style={{ paddingLeft: '40px' }} placeholder="Acme Corp" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="input-light" style={{ paddingLeft: '40px' }} placeholder="+1234567890" />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="input-light" style={{ paddingLeft: '40px' }} placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={regLoading} className="btn-brand" style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px', marginTop: '6px' }}>
                  {regLoading ? 'Creating account…' : 'Register Account'}
                  <ArrowRight style={{ width: '16px' }} />
                </button>
              </form>
            </>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <>
              <button type="button" onClick={() => { switchView('login'); setForgotSent(false); setForgotEmail(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontWeight: 700, fontSize: '13px', fontFamily: 'Outfit, sans-serif', padding: 0, marginBottom: '24px' }}>
                <ChevronLeft style={{ width: '15px' }} />
                Back to sign in
              </button>

              {!forgotSent ? (
                <>
                  <div style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                      Reset password
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                      Enter your email to receive a password reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '7px' }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="input-light" style={{ paddingLeft: '40px' }} placeholder="you@company.com" />
                      </div>
                    </div>

                    <button type="submit" disabled={forgotLoading} className="btn-brand" style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px', marginTop: '4px' }}>
                      {forgotLoading ? 'Sending link…' : 'Send Reset Link'}
                      <ArrowRight style={{ width: '16px' }} />
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--green-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 style={{ width: '30px', color: 'var(--green)' }} />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                    Reset link sent!
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: '1.6' }}>
                    We sent instructions to:
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand)', margin: '0 0 16px' }}>
                    {forgotEmail}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <Shield style={{ width: '12px' }} />
                    Links expire in 1 hour
                  </div>
                  <button type="button" onClick={() => { switchView('login'); setForgotSent(false); setForgotEmail(''); }}
                    style={{ marginTop: '24px', background: 'none', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '10px 22px', color: 'var(--brand)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                    ← Back to sign in
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
