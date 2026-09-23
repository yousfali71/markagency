import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, Lock, Mail, ArrowRight, Users, TicketCheck, CheckCircle2,
  Eye, EyeOff, ChevronLeft, Shield, User, Phone, Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, apiClient } from '../services/api';
import { Logo } from '../components/Logo';

type View = 'login' | 'register' | 'forgot';

// ─── Feature item (left panel) ────────────────────────────────────────────────
const FeatureItem: React.FC<{ icon: React.ElementType; label: string; sub: string }> = ({
  icon: Icon, label, sub,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{
      width: '42px', height: '42px', borderRadius: '13px',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon style={{ width: '20px', color: 'white' }} />
    </div>
    <div>
      <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{sub}</p>
    </div>
  </div>
);

// ─── Simple labelled input ─────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  suffix?: React.ReactNode;
}> = ({ label, id, type = 'text', value, onChange, icon: Icon, placeholder, required, autoComplete, suffix }) => (
  <div>
    <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '7px' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '15px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        className="input-light"
        style={{ paddingLeft: '40px', paddingRight: suffix ? '40px' : undefined }}
        placeholder={placeholder}
      />
      {suffix && (
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
          {suffix}
        </div>
      )}
    </div>
  </div>
);

// ─── Password field with show/hide ────────────────────────────────────────────
const PasswordField: React.FC<{ label: string; id: string; value: string; onChange: (v: string) => void }> = ({
  label, id, value, onChange,
}) => {
  const [show, setShow] = useState(false);
  const Ico = show ? EyeOff : Eye;
  return (
    <Field
      label={label}
      id={id}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      icon={Lock}
      placeholder="••••••••"
      autoComplete={id === 'password' ? 'current-password' : 'new-password'}
      suffix={
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
          <Ico style={{ width: '15px', color: 'var(--text-muted)' }} />
        </button>
      }
    />
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { login, loginWithTokens, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [view, setView] = useState<View>('login');

  // Login
  const [loginEmail, setLoginEmail]       = useState('owner@agency.com');
  const [loginPassword, setLoginPassword] = useState('AgencyOwner@123');
  const [loginError, setLoginError]       = useState('');

  // Register
  const [regName, setRegName]       = useState('');
  const [regEmail, setRegEmail]     = useState('');
  const [regPass, setRegPass]       = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPhone, setRegPhone]     = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError]     = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot
  const [forgotEmail, setForgotEmail]   = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent]     = useState(false);

  const switchView = (v: View) => {
    setView(v);
    setLoginError('');
    setRegError('');
    setRegSuccess('');
  };

  // ── Handlers ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.';
      setLoginError(msg);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    if (regPass !== regConfirm) { setRegError('Passwords do not match.'); return; }
    if (regPass.length < 8)    { setRegError('Password must be at least 8 characters.'); return; }
    setRegLoading(true);
    try {
      const res = await api.registerClient({ name: regName, email: regEmail, password: regPass, companyName: regCompany, contactPhone: regPhone });
      // Directly log in with the tokens returned by registration — no second round-trip
      loginWithTokens(res.accessToken, res.refreshToken, res.user);
      navigate('/');
    } catch (err: any) {
      setRegError(err?.response?.data?.message || err?.message || 'Registration failed. Please try again.');
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

  // ── Left-panel copy per view ──
  const leftCopy: Record<View, { h1: string; p: string }> = {
    login:    { h1: 'Manage markPocket\nAgency Workspace', p: 'Track clients, manage service requests, log deliverables, and issue invoices — all in markPocket.' },
    register: { h1: 'Join the\nmarkPocket network', p: 'Create your client account and start collaborating with your agency team today.' },
    forgot:   { h1: 'Account\nrecovery', p: "No worries — we'll send a secure reset link to your inbox within minutes." },
  };
  const lc = leftCopy[view];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg-body)' }}>

      {/* ── LEFT: Branded panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex" style={{
        width: '45%', flexShrink: 0,
        background: 'linear-gradient(145deg, #6B47B8 0%, #7B5EA7 40%, #4ECDC4 100%)',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo variant="hero" size="lg" />
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '38px', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px', whiteSpace: 'pre-line' }}>
            {lc.h1}
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 40px', lineHeight: '1.6' }}>
            {lc.p}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FeatureItem icon={Users}        label="Client Management"   sub="Track all active retainers & projects" />
            <FeatureItem icon={TicketCheck}  label="Request Tracking"    sub="Full lifecycle visibility for every ticket" />
            <FeatureItem icon={CheckCircle2} label="Deliverables Vault"  sub="Log & showcase completed creative assets" />
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '18px 22px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '0 0 10px', fontStyle: 'italic', lineHeight: '1.5' }}>
            "markPocket transformed how we manage our agency clients. The visibility is unmatched."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80"
              alt="Karim El-Sayed"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
            />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', margin: 0 }}>Karim El-Sayed</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Agency Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form panel ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Logo size="md" />
          </div>

          {/* ══════ LOGIN ══════ */}
          {view === 'login' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  Sign in to your markPocket agency dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label={t('email')} id="login-email" type="email" value={loginEmail}
                  onChange={setLoginEmail} icon={Mail} placeholder="you@agency.com" autoComplete="email" required />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <label htmlFor="password" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)' }}>
                      {t('password')}
                    </label>
                    <button type="button" onClick={() => switchView('forgot')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--brand)', fontFamily: 'Outfit, sans-serif', padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                  <PasswordField label="" id="password" value={loginPassword} onChange={setLoginPassword} />
                </div>

                {loginError && (
                  <p style={{ fontSize: '13px', color: 'var(--red)', margin: 0, background: 'var(--red-alpha)', padding: '10px 14px', borderRadius: '10px' }}>
                    {loginError}
                  </p>
                )}

                <button type="submit" disabled={authLoading} className="btn-dark"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px', marginTop: '4px' }}>
                  {authLoading ? t('loading') : t('login')}
                  <ArrowRight style={{ width: '16px' }} />
                </button>
              </form>

              {/* Quick demo */}
              <div style={{ marginTop: '28px', padding: '18px', background: 'white', borderRadius: '14px', boxShadow: 'var(--shadow-xs)', border: '1.5px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quick Demo Login
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Agency Owner', email: 'owner@agency.com', pass: 'AgencyOwner@123' },
                    { label: 'Staff Member', email: 'sarah@agency.com',  pass: 'AgencyOwner@123' },
                  ].map(({ label, email: e, pass }) => (
                    <button key={e} onClick={() => { setLoginEmail(e); setLoginPassword(pass); }}
                      style={{ background: 'var(--brand-alpha)', color: 'var(--brand)', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create account link */}
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', margin: '20px 0 0', fontWeight: 500 }}>
                Need a client account?{' '}
                <button type="button" onClick={() => switchView('register')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontWeight: 700, fontSize: '13px', fontFamily: 'Outfit, sans-serif', padding: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Create one →
                </button>
              </p>
            </>
          )}

          {/* ══════ REGISTER ══════ */}
          {view === 'register' && (
            <>
              <button type="button" onClick={() => switchView('login')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontWeight: 700, fontSize: '13px', fontFamily: 'Outfit, sans-serif', padding: 0, marginBottom: '24px' }}>
                <ChevronLeft style={{ width: '15px' }} />
                Back to sign in
              </button>

              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Create your account
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  Join markPocket as a client — get started in seconds.
                </p>
              </div>

              {regError && (
                <p style={{ fontSize: '13px', color: 'var(--red)', background: 'var(--red-alpha)', padding: '10px 14px', borderRadius: '10px', margin: '0 0 16px' }}>
                  {regError}
                </p>
              )}
              {regSuccess && (
                <p style={{ fontSize: '13px', color: 'var(--green)', background: 'var(--green-alpha)', padding: '10px 14px', borderRadius: '10px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <CheckCircle2 style={{ width: '14px', flexShrink: 0 }} />
                  {regSuccess}
                </p>
              )}

              {!regSuccess && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="Full name"      id="reg-name"    value={regName}    onChange={setRegName}    icon={User}      placeholder="Your full name"     required />
                  <Field label="Email address"  id="reg-email"   type="email" value={regEmail}   onChange={setRegEmail}   icon={Mail}      placeholder="you@company.com"    required autoComplete="email" />
                  <Field label="Company name"   id="reg-company" value={regCompany} onChange={setRegCompany} icon={Building2} placeholder="Acme Inc."          required />
                  <Field label="Phone number"   id="reg-phone"   type="tel"   value={regPhone}   onChange={setRegPhone}   icon={Phone}     placeholder="+1 555 000 0000" />
                  <PasswordField label="Password"         id="reg-pass"    value={regPass}    onChange={setRegPass} />
                  <PasswordField label="Confirm password" id="reg-confirm" value={regConfirm} onChange={setRegConfirm} />

                  <button type="submit" disabled={regLoading} className="btn-dark"
                    style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px', marginTop: '4px' }}>
                    {regLoading ? 'Creating account…' : 'Create account'}
                    <ArrowRight style={{ width: '16px' }} />
                  </button>
                </form>
              )}
            </>
          )}

          {/* ══════ FORGOT PASSWORD ══════ */}
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
                      Forgot password?
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
                      Enter your email and we'll send you a secure reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Field label="Email address" id="forgot-email" type="email" value={forgotEmail}
                      onChange={setForgotEmail} icon={Mail} placeholder="you@agency.com" autoComplete="email" required />

                    <button type="submit" disabled={forgotLoading} className="btn-dark"
                      style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px', marginTop: '4px' }}>
                      {forgotLoading ? 'Sending…' : 'Send reset link'}
                      <ArrowRight style={{ width: '16px' }} />
                    </button>
                  </form>
                </>
              ) : (
                /* Success state */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--green-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 style={{ width: '30px', color: 'var(--green)' }} />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                    Check your inbox!
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 6px', lineHeight: '1.6' }}>
                    If an account exists for
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand)', margin: '0 0 16px' }}>
                    {forgotEmail}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 28px', lineHeight: '1.6' }}>
                    you'll receive a reset link within a few minutes. Check your spam folder too.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <Shield style={{ width: '12px' }} />
                    Secured · links expire in 1 hour
                  </div>
                  <button type="button"
                    onClick={() => { switchView('login'); setForgotSent(false); setForgotEmail(''); }}
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
