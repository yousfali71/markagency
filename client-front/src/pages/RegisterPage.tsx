import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { Logo } from '../components/Logo';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg-body)' }}>

      {/* LEFT: Branded gradient panel */}
      <div className="hidden lg:flex" style={{
        width: '45%', flexShrink: 0,
        background: 'linear-gradient(145deg, #35B5B1 0%, #4ECDC4 45%, #7B5EA7 100%)',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Logo variant="hero" subtitle="Portal" size="lg" />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '38px', fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: '1.15', letterSpacing: '-1px' }}>
            Agency Managed<br />Client Accounts
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: '0 0 40px', lineHeight: '1.6' }}>
            Client workspace accounts are set up directly by your assigned marketing agency representative for security and privacy.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck style={{ width: '18px', color: 'white' }} />
              </div>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Agency provisioned credentials</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: '18px', color: 'white' }} />
              </div>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Secure client-agency access</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '18px 22px' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: 0, fontStyle: 'italic', lineHeight: '1.5' }}>
            "markPocket streamlines all our marketing requests in one central dashboard."
          </p>
        </div>
      </div>

      {/* RIGHT: Informative Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>

          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <Logo subtitle="Portal" size="md" />
          </div>

          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(53, 181, 177, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock style={{ width: '30px', color: 'var(--brand)' }} />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Account Created By Agency
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 28px', lineHeight: '1.6' }}>
            There is no direct public sign-up for client accounts. Your marketing agency creates your account and provides you with your login email and password.
          </p>

          <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 8px' }}>
              How to get access:
            </p>
            <ol style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Contact your assigned Marketing Agency manager.</li>
              <li>Receive your login credentials (email & password).</li>
              <li>Sign in to your client workspace dashboard.</li>
            </ol>
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-brand"
            style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: '15px' }}
          >
            Go to Client Login
            <ArrowRight style={{ width: '16px' }} />
          </button>

        </div>
      </div>
    </div>
  );
};

