import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Layers, TicketCheck, CheckCircle2, FileText,
  Globe, Moon, Sun, LogOut, Bell, X, ChevronRight, Menu,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import type { AppNotification } from '../types/api';
import { Logo } from './Logo';

/* ── Decorative sidebar blob ── */
const SidebarBlob: React.FC = () => (
  <svg className="sidebar-blob" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M150,30 C200,20 260,80 270,140 C280,200 240,260 180,275 C120,290 50,260 25,200 C0,140 20,60 70,35 C90,25 120,38 150,30 Z"
      fill="url(#blobGrad)"
      opacity="0.55"
    />
    <defs>
      <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ECDC4" />
        <stop offset="100%" stopColor="#7B5EA7" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Avatar stack component ── */
const AvatarStack: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80',
  ].slice(0, Math.min(count, 3));
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {avatars.map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.5)',
            marginLeft: i === 0 ? 0 : '-8px',
            objectFit: 'cover',
          }}
        />
      ))}
      {count > 3 && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          border: '2px solid rgba(255,255,255,0.5)',
          marginLeft: '-8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 800, color: 'white',
        }}>
          +{count - 3}
        </div>
      )}
    </div>
  );
};

export { AvatarStack };

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('agency_sidebar_collapsed') === 'true';
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('agency_sidebar_collapsed', String(next));
      return next;
    });
  };

  const fetchNotifs = async () => {
    const res = await api.getNotifications();
    setNotifications(res.data);
    setUnreadCount(res.unreadCount);
  };

  useEffect(() => {
    fetchNotifs();
    const socket = getSocket();
    if (socket) {
      socket.on('notification:new', (n: AppNotification) => {
        setNotifications(prev => [n, ...prev]);
        setUnreadCount(p => p + 1);
      });
    }
    return () => { if (socket) socket.off('notification:new'); };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { path: '/', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/clients', label: t('clients'), icon: Users },
    { path: '/catalog', label: t('catalog'), icon: Layers },
    { path: '/requests', label: t('requests'), icon: TicketCheck },
    { path: '/deliverables', label: t('deliverables'), icon: CheckCircle2 },
    { path: '/invoices', label: t('invoices'), icon: FileText },
  ];

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const renderSidebar = (isMobileDrawer = false) => {
    const effectiveCollapsed = isMobileDrawer ? false : isCollapsed;

    return (
      <aside style={{
        width: effectiveCollapsed ? '68px' : '260px',
        height: '100%', flexShrink: 0,
        background: 'var(--bg-surface)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        boxShadow: '4px 0 28px rgba(0,0,0,0.04)',
        zIndex: 20,
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Logo & Toggle Header */}
        <div style={{
          padding: effectiveCollapsed ? '20px 10px' : '20px 18px 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: effectiveCollapsed ? 'center' : 'space-between',
          transition: 'all 0.28s ease'
        }}>
          {!effectiveCollapsed ? (
            <>
              <Logo size="md" />
              {!isMobileDrawer && (
                <button
                  onClick={toggleSidebar}
                  title="Collapse sidebar"
                  className="hidden lg:flex"
                  style={{
                    background: 'var(--bg-body)', border: '1.5px solid var(--border)', borderRadius: '10px',
                    padding: '6px', cursor: 'pointer', color: 'var(--text-muted)',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
                  }}
                >
                  <PanelLeftClose style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={toggleSidebar}
                title="Expand sidebar"
                className="hidden lg:flex"
                style={{
                  background: 'var(--bg-body)', border: '1.5px solid var(--border)', borderRadius: '10px',
                  padding: '7px', cursor: 'pointer', color: 'var(--brand)',
                  alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease',
                }}
              >
                <PanelLeftOpen style={{ width: '18px', height: '18px' }} />
              </button>
              <Logo size="sm" hideText={true} />
            </div>
          )}

          {/* Close button for mobile drawer */}
          {isMobileDrawer && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '10px',
                padding: '6px', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>

        {/* User profile card */}
        {!effectiveCollapsed ? (
          <div style={{ padding: '0 18px 20px', textAlign: 'center', transition: 'opacity 0.2s ease' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
              <div
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
                  border: '3px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 900, color: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  textTransform: 'uppercase',
                }}
              >
                {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{
                position: 'absolute', bottom: '3px', right: '2px',
                width: '13px', height: '13px', background: '#52C792',
                borderRadius: '50%', border: '2px solid white',
              }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        ) : (
          <div style={{ padding: '0 0 16px', display: 'flex', justifyContent: 'center' }}>
            <div
              title={user?.name || user?.email}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
                border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 800, color: '#FFFFFF',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: effectiveCollapsed ? '0 10px 14px' : '0 18px 14px' }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: effectiveCollapsed ? '0 8px' : '0 12px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                title={effectiveCollapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                  gap: effectiveCollapsed ? '0' : '12px',
                  padding: effectiveCollapsed ? '11px 0' : '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13.5px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--brand)' : 'var(--text-muted)',
                  background: isActive ? 'var(--brand-alpha)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  marginBottom: '4px',
                  cursor: 'pointer',
                })}
              >
                <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                {!effectiveCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Controls */}
        <div style={{
          padding: effectiveCollapsed ? '12px 6px' : '14px 12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '7px',
          position: 'relative', zIndex: 2,
        }}>
          {!effectiveCollapsed ? (
            <>
              <div style={{ display: 'flex', gap: '7px' }}>
                <button
                  onClick={toggleLanguage}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    padding: '8px', borderRadius: '10px',
                    background: 'var(--bg-body)', border: '1.5px solid var(--border)',
                    fontSize: '12px', fontWeight: 700, color: 'var(--text-body)',
                    fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                  }}
                >
                  <Globe style={{ width: '13px', height: '13px' }} />
                  {language === 'ar' ? 'EN' : 'AR'}
                </button>
                <button
                  onClick={toggleTheme}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', borderRadius: '10px',
                    background: 'var(--bg-body)', border: '1.5px solid var(--border)',
                    color: 'var(--text-body)', cursor: 'pointer',
                  }}
                >
                  {theme === 'dark'
                    ? <Sun style={{ width: '14px', height: '14px', color: '#D97706' }} />
                    : <Moon style={{ width: '14px', height: '14px' }} />
                  }
                </button>

                {/* Notifications bell */}
                <div ref={notifRef} style={{ position: 'relative', flex: 1 }}>
                  <button
                    onClick={() => setShowNotif(v => !v)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '8px', borderRadius: '10px', position: 'relative',
                      background: 'var(--bg-body)', border: '1.5px solid var(--border)',
                      color: 'var(--text-body)', cursor: 'pointer',
                    }}
                  >
                    <Bell style={{ width: '14px', height: '14px' }} />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '13px', height: '13px', background: 'var(--red)',
                        color: 'white', fontSize: '8px', fontWeight: 800,
                        borderRadius: '50%', border: '1.5px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div style={{
                      position: 'fixed',
                      bottom: '80px',
                      left: language === 'ar' ? 'auto' : '256px',
                      right: language === 'ar' ? '256px' : 'auto',
                      width: '300px', background: 'var(--bg-surface)',
                      borderRadius: '18px', boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border)', padding: '14px',
                      zIndex: 200,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-dark)' }}>{t('notifications')}</span>
                        <button
                          onClick={() => setShowNotif(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                        >
                          <X style={{ width: '14px' }} />
                        </button>
                      </div>
                      <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.length === 0
                          ? <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>{t('noNotifications')}</p>
                          : notifications.slice(0, 8).map(n => (
                            <div
                              key={n.id}
                              onClick={async () => { await api.markNotificationRead(n.id); fetchNotifs(); }}
                              style={{
                                padding: '10px 12px', borderRadius: '12px', fontSize: '13px',
                                background: n.isRead ? 'var(--bg-body)' : 'var(--brand-alpha)',
                                color: n.isRead ? 'var(--text-muted)' : 'var(--text-dark)',
                                cursor: 'pointer',
                              }}
                            >
                              <p style={{ margin: 0, fontWeight: n.isRead ? 400 : 600 }}>{n.message}</p>
                              <span style={{ fontSize: '10px', color: 'var(--text-placeholder)' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 12px', borderRadius: '10px', width: '100%',
                  background: 'var(--red-alpha)', color: 'var(--red)',
                  border: 'none', fontSize: '12px', fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                }}
              >
                <LogOut style={{ width: '14px', height: '14px' }} />
                <span>{t('logout')}</span>
                <ChevronRight style={{ width: '12px', height: '12px', marginLeft: 'auto' }} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--bg-body)', border: '1.5px solid var(--border)',
                  color: 'var(--text-body)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {theme === 'dark' ? <Sun style={{ width: '15px', color: '#D97706' }} /> : <Moon style={{ width: '15px' }} />}
              </button>
              <button
                onClick={toggleLanguage}
                title="Switch language"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--bg-body)', border: '1.5px solid var(--border)',
                  fontSize: '11px', fontWeight: 800, color: 'var(--text-body)',
                  fontFamily: 'Outfit, sans-serif', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                title="Logout"
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--red-alpha)', color: 'var(--red)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <LogOut style={{ width: '15px' }} />
              </button>
            </div>
          )}
        </div>

        <SidebarBlob />
      </aside>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-body)', direction: dir }}>

      {/* ─────────────── MOBILE TOP HEADER ─────────────── */}
      <header className="mobile-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '10px',
              padding: '7px', cursor: 'pointer', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>
          <div style={{ minWidth: 0, overflow: 'hidden', flexShrink: 1 }}>
            <Logo size="sm" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={toggleLanguage}
            style={{
              padding: '6px 9px', borderRadius: '10px', background: 'var(--bg-body)',
              border: '1px solid var(--border)', fontSize: '11px', fontWeight: 800,
              color: 'var(--text-body)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            }}
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
          <button
            onClick={toggleTheme}
            style={{
              padding: '6px 9px', borderRadius: '10px', background: 'var(--bg-body)',
              border: '1px solid var(--border)', color: 'var(--text-body)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? <Sun style={{ width: '14px', height: '14px', color: '#D97706' }} /> : <Moon style={{ width: '14px', height: '14px' }} />}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Desktop fixed sidebar */}
        <div className="desktop-sidebar-container">
          {renderSidebar(false)}
        </div>

        {/* Mobile overlay drawer */}
        {mobileMenuOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }} className="mobile-drawer-overlay">
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
            />
            <div style={{ position: 'relative', zIndex: 101, height: '100%' }}>
              {renderSidebar(true)}
            </div>
          </div>
        )}

        {/* ─────────────── MAIN CONTENT ─────────────── */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {children}
        </main>
      </div>

    </div>
  );
};
