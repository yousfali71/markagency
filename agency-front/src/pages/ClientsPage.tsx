import React, { useState, useEffect } from 'react';
import {
  UserPlus, Search, Building2, CreditCard, Trash2, X, Phone,
  Share2, Send, Calendar, CheckCircle2, ExternalLink, Plus,
  Check, Clock, Sparkles, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { Client, SocialAccount, SocialPost } from '../types/api';

const CARD_COLORS = [
  { bg: 'var(--brand-alpha)', color: 'var(--brand)' },
  { bg: 'var(--teal-alpha)', color: 'var(--teal)' },
  { bg: 'var(--orange-alpha)', color: 'var(--orange)' },
  { bg: 'var(--green-alpha)', color: 'var(--green)' },
  { bg: 'var(--yellow-alpha)', color: '#A07010' },
];

export const ClientsPage: React.FC = () => {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: 'Password123',
    companyName: '', contactPhone: '',
    assignedAgencyUserId: 'user-agency-staff1',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client Detail Modal States
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientModalTab, setClientModalTab] = useState<'social' | 'publish' | 'posts' | 'plan'>('social');
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loadingSocial, setLoadingSocial] = useState(false);

  // Publish Form State
  const [publishForm, setPublishForm] = useState({
    accountId: '',
    message: '',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    scheduledPublishTime: '',
  });
  const [publishing, setPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  const loadClients = async () => {
    setErrorMsg(null);
    try {
      const data = await api.getClients(search);
      setClients(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load clients';
      setErrorMsg(msg);
      setClients([]);
    }
  };

  useEffect(() => { loadClients(); }, [search]);

  // Load social accounts when selected client changes
  useEffect(() => {
    if (selectedClient) {
      loadSocialAccounts(selectedClient.id);
    }
  }, [selectedClient]);

  const loadSocialAccounts = async (clientId: string) => {
    setLoadingSocial(true);
    try {
      const accs = await api.getSocialAccounts(clientId);
      setSocialAccounts(accs);
      if (accs.length > 0 && !publishForm.accountId) {
        setPublishForm(p => ({ ...p, accountId: accs[0].id }));
      }
    } finally {
      setLoadingSocial(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await api.registerClient({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        contactPhone: formData.contactPhone,
      });
      setShowModal(false);
      setFormData({ name: '', email: '', password: 'Password123', companyName: '', contactPhone: '', assignedAgencyUserId: 'user-agency-staff1' });
      loadClients();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create client';
      setErrorMsg(msg);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Remove this client account?')) {
      try {
        await api.deleteClient(id);
        if (selectedClient?.id === id) setSelectedClient(null);
        loadClients();
      } catch (err: any) {
        alert(`Failed to delete client: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleConnectFacebook = async (clientId: string) => {
    try {
      const redirectUrl = await api.connectFacebook(clientId);
      await loadSocialAccounts(clientId);
      if (redirectUrl && redirectUrl.startsWith('http')) {
        window.open(redirectUrl, '_blank');
      }
    } catch (err: any) {
      console.error('❌ [Facebook Connect Failure]:', err);
      alert(`Connect Facebook Failed: ${err.message}`);
    }
  };

  const handleDisconnectSocial = async (accountId: string) => {
    if (!selectedClient) return;
    if (confirm('Disconnect this social account?')) {
      await api.disconnectSocialAccount(accountId, selectedClient.id);
      loadSocialAccounts(selectedClient.id);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !publishForm.message.trim()) return;
    setPublishing(true);
    setPublishSuccessMsg(null);
    try {
      const scheduledEpoch = publishForm.scheduledPublishTime
        ? new Date(publishForm.scheduledPublishTime).getTime()
        : undefined;

      const res = await api.publishSocialPost(selectedClient.id, {
        accountId: publishForm.accountId || socialAccounts[0]?.id || 'soc-1',
        message: publishForm.message,
        imageUrl: publishForm.imageUrl,
        scheduledPublishTime: scheduledEpoch,
      });

      const newPost: SocialPost = {
        id: 'post-' + Date.now(),
        clientId: selectedClient.id,
        accountId: publishForm.accountId || socialAccounts[0]?.id || 'soc-1',
        account: socialAccounts.find(a => a.id === publishForm.accountId) || socialAccounts[0],
        message: publishForm.message,
        imageUrl: publishForm.imageUrl,
        scheduledPublishTime: scheduledEpoch,
        status: scheduledEpoch && scheduledEpoch > Date.now() ? 'scheduled' : 'published',
        publishedId: res.results?.[0]?.id || 'pub-1001',
        createdAt: new Date().toISOString(),
      };

      setSocialPosts(prev => [newPost, ...prev]);
      setPublishSuccessMsg(scheduledEpoch ? 'Post scheduled successfully!' : 'Post published to Facebook & Instagram successfully!');
      setPublishForm({
        accountId: socialAccounts[0]?.id || '',
        message: '',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        scheduledPublishTime: '',
      });
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px' }}>

      {errorMsg && (
        <div style={{
          background: 'var(--red-alpha)', border: '1px solid var(--red)',
          color: 'var(--red)', borderRadius: '12px', padding: '14px 18px',
          marginBottom: '20px', fontSize: '14px', fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠️ Backend API Error: {errorMsg} (HTTP 403 Forbidden - Insufficient permissions. Make sure you are signed in as Agency Owner: <code>owner@agency.com</code>)</span>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('clients')}</h1>
          <p className="page-sub">Click any client to view details, manage social media accounts & publish posts</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border)', flex: 1, minWidth: '180px' }}>
            <Search style={{ width: '15px', color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', width: '100%', fontFamily: 'Outfit, sans-serif', color: 'var(--text-dark)' }}
            />
          </div>
          <button onClick={() => setShowModal(true)} className="btn-dark">
            <UserPlus style={{ width: '15px' }} />
            {t('createClientAccount')}
          </button>
        </div>
      </div>

      {/* Client cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {clients.map((client, idx) => {
          const { bg, color } = CARD_COLORS[idx % CARD_COLORS.length];
          return (
            <div
              key={client.id}
              className="surface-card"
              onClick={() => { setSelectedClient(client); setClientModalTab('social'); }}
              style={{
                padding: '20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer',
                borderLeft: `4px solid ${color}`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              {/* Top: avatar + company */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 style={{ width: '20px', color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 3px', letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.companyName}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: 'monospace' }}>
                    ID: {client.id.substring(0, 14)}…
                  </p>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ width: '13px', color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-body)', fontFamily: 'monospace' }}>{client.contactPhone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard style={{ width: '13px', color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color }}>
                    {client.activePlan?.name || 'Starter Package'}
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ${client.activePlan?.price || 799}/mo
                    </span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Share2 style={{ width: '13px', color: '#1877F2', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    Social Media Integration Active
                  </span>
                </div>
              </div>

              {/* Actions footer */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--brand)', fontWeight: 700 }}>
                  Click to view details & publish →
                </span>
                <button
                  onClick={e => handleDelete(client.id, e)}
                  style={{
                    background: 'var(--red-alpha)', color: 'var(--red)', border: 'none',
                    borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11px', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  <Trash2 style={{ width: '12px' }} />
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {clients.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '20px', boxShadow: 'var(--shadow-xs)' }}>
            <Building2 style={{ width: '32px', marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', margin: 0 }}>No clients found{search ? ` for "${search}"` : ''}</p>
          </div>
        )}
      </div>

      {/* ─────────────── CLIENT DETAILS & SOCIAL MEDIA HUB MODAL ─────────────── */}
      {selectedClient && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
          <div className="surface-card" style={{ width: '96vw', maxWidth: '780px', padding: '24px', boxShadow: 'var(--shadow-lg)', maxHeight: '92vh', overflowY: 'auto', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--brand-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 style={{ width: '26px', color: 'var(--brand)' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.5px' }}>{selectedClient.companyName}</h2>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', background: 'var(--green-alpha)', color: 'var(--green)', fontSize: '11px', fontWeight: 800 }}>Active Client</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0', fontFamily: 'monospace' }}>
                    Client ID: {selectedClient.id} · Phone: {selectedClient.contactPhone}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                <X style={{ width: '18px' }} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1.5px solid var(--border)', paddingBottom: '10px' }}>
              <button
                onClick={() => setClientModalTab('social')}
                style={{
                  padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  background: clientModalTab === 'social' ? 'var(--brand)' : 'var(--bg-body)',
                  color: clientModalTab === 'social' ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s ease',
                }}
              >
                <Share2 style={{ width: '14px' }} />
                Social Accounts ({socialAccounts.length})
              </button>
              <button
                onClick={() => setClientModalTab('publish')}
                style={{
                  padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  background: clientModalTab === 'publish' ? 'var(--brand)' : 'var(--bg-body)',
                  color: clientModalTab === 'publish' ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s ease',
                }}
              >
                <Send style={{ width: '14px' }} />
                Publish & Schedule Post
              </button>
              <button
                onClick={() => setClientModalTab('posts')}
                style={{
                  padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  background: clientModalTab === 'posts' ? 'var(--brand)' : 'var(--bg-body)',
                  color: clientModalTab === 'posts' ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s ease',
                }}
              >
                <Calendar style={{ width: '14px' }} />
                Post Schedule ({socialPosts.length})
              </button>
              <button
                onClick={() => setClientModalTab('plan')}
                style={{
                  padding: '9px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                  background: clientModalTab === 'plan' ? 'var(--brand)' : 'var(--bg-body)',
                  color: clientModalTab === 'plan' ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s ease',
                }}
              >
                <CreditCard style={{ width: '14px' }} />
                Subscription Plan
              </button>
            </div>

            {/* TAB 1: CONNECTED SOCIAL ACCOUNTS */}
            {clientModalTab === 'social' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* OAuth Connect Banner */}
                <div style={{
                  padding: '18px 20px', borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.12) 0%, rgba(225, 48, 108, 0.12) 100%)',
                  border: '1.5px solid rgba(24, 119, 242, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Share2 style={{ width: '18px', color: '#1877F2' }} />
                      Connect Facebook Page & Instagram Business
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                      Authorize Facebook OAuth to auto-sync Page tokens, Instagram Business accounts, and schedule automatic posts.
                    </p>
                  </div>
                  <button
                    onClick={() => handleConnectFacebook(selectedClient.id)}
                    style={{
                      background: '#1877F2', color: '#FFFFFF', border: 'none',
                      borderRadius: '12px', padding: '10px 18px', fontSize: '13px', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)', fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <span>Connect Facebook & IG</span>
                    <ExternalLink style={{ width: '14px' }} />
                  </button>
                </div>

                {/* Accounts List */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', margin: '8px 0 0' }}>Connected Accounts</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {socialAccounts.map(acc => (
                    <div
                      key={acc.id}
                      style={{
                        padding: '14px 18px', borderRadius: '16px', background: 'var(--bg-body)',
                        border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '12px',
                          background: acc.platform === 'facebook' ? 'rgba(24,119,242,0.12)' : 'rgba(225,48,108,0.12)',
                          color: acc.platform === 'facebook' ? '#1877F2' : '#E1306C',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px',
                        }}>
                          {acc.platform === 'facebook' ? 'fb' : 'IG'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>{acc.pageName}</h5>
                            <span style={{ padding: '2px 8px', borderRadius: '99px', background: 'var(--green-alpha)', color: 'var(--green)', fontSize: '10px', fontWeight: 800 }}>Connected</span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: 'monospace' }}>
                            Page ID: {acc.pageId} {acc.instagramUsername && `· IG: ${acc.instagramUsername}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDisconnectSocial(acc.id)}
                        style={{
                          background: 'none', border: '1px solid var(--border)',
                          borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 700,
                          color: 'var(--red)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                        }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ))}

                  {socialAccounts.length === 0 && !loadingSocial && (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-body)', borderRadius: '16px' }}>
                      No social accounts connected yet. Click "Connect Facebook & IG" above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PUBLISH & SCHEDULE POST */}
            {clientModalTab === 'publish' && (
              <form onSubmit={handlePublishPost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {publishSuccessMsg && (
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'var(--green-alpha)', color: 'var(--green)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 style={{ width: '16px' }} />
                    <span>{publishSuccessMsg}</span>
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Select Target Social Account</label>
                  <select
                    value={publishForm.accountId}
                    onChange={e => setPublishForm({ ...publishForm, accountId: e.target.value })}
                    className="input-light"
                    style={{ width: '100%', fontFamily: 'Outfit, sans-serif' }}
                  >
                    {socialAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.platform.toUpperCase()} — {acc.pageName} ({acc.instagramUsername || acc.pageId})
                      </option>
                    ))}
                    {socialAccounts.length === 0 && <option value="">Brand Official Page (Demo FB & IG)</option>}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Post Caption / Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="🚀 Exciting news! Check out our new project with modern aesthetics. #marketing #launch"
                    value={publishForm.message}
                    onChange={e => setPublishForm({ ...publishForm, message: e.target.value })}
                    className="input-light"
                    style={{ width: '100%', fontFamily: 'Outfit, sans-serif', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Image URL / Asset Link</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={publishForm.imageUrl}
                    onChange={e => setPublishForm({ ...publishForm, imageUrl: e.target.value })}
                    className="input-light"
                  />
                  {publishForm.imageUrl && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={publishForm.imageUrl} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Image Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>
                    Schedule Date & Time (Optional — leave empty to Publish Immediately)
                  </label>
                  <input
                    type="datetime-local"
                    value={publishForm.scheduledPublishTime}
                    onChange={e => setPublishForm({ ...publishForm, scheduledPublishTime: e.target.value })}
                    className="input-light"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="btn-brand"
                  style={{ padding: '12px', justifyContent: 'center', fontSize: '14px', fontWeight: 800, gap: '8px', opacity: publishing ? 0.7 : 1 }}
                >
                  <Send style={{ width: '16px' }} />
                  <span>{publishing ? 'Publishing Post...' : publishForm.scheduledPublishTime ? 'Schedule Social Post' : 'Publish Post Now to Facebook & IG'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: POST SCHEDULE */}
            {clientModalTab === 'posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {socialPosts.map(post => (
                  <div
                    key={post.id}
                    style={{
                      padding: '16px', borderRadius: '16px', background: 'var(--bg-body)',
                      border: '1.5px solid var(--border)', display: 'flex', gap: '14px', alignItems: 'flex-start',
                    }}
                  >
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Post" style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          padding: '3px 9px', borderRadius: '99px', fontSize: '10px', fontWeight: 800,
                          background: post.status === 'scheduled' ? 'var(--yellow-alpha)' : 'var(--green-alpha)',
                          color: post.status === 'scheduled' ? '#9A7010' : 'var(--green)',
                          textTransform: 'uppercase',
                        }}>
                          {post.status}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {post.scheduledPublishTime ? new Date(post.scheduledPublishTime).toLocaleString() : new Date(post.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-dark)', margin: 0, lineHeight: '1.4' }}>{post.message}</p>
                    </div>
                  </div>
                ))}

                {socialPosts.length === 0 && (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-body)', borderRadius: '16px' }}>
                    No posts published or scheduled yet. Click "Publish & Schedule Post" tab above to create one.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PLAN & SUBSCRIPTION */}
            {clientModalTab === 'plan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: '18px', background: 'var(--brand-alpha)', border: '1.5px solid var(--brand-alpha2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand)', margin: 0 }}>
                      {selectedClient.activePlan?.name || 'Growth Subscription Package'}
                    </h3>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)' }}>
                      ${selectedClient.activePlan?.price || 1499}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/mo</span>
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: '0 0 16px', lineHeight: '1.5' }}>
                    {selectedClient.activePlan?.description || 'Full-suite marketing package including 20 Instagram Carousel graphics, Reels editing, copywriting, and automated social publishing.'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '12px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Monthly Quota</span>
                      <strong style={{ color: 'var(--text-dark)', fontSize: '14px' }}>20 Deliverables / mo</strong>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '12px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Next Billing Renewal</span>
                      <strong style={{ color: 'var(--green)', fontSize: '14px' }}>Oct 1, 2026 (Active)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="surface-card" style={{ width: '92vw', maxWidth: '500px', padding: '24px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--brand-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus style={{ width: '18px', color: 'var(--brand)' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>{t('createClientAccount')}</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X style={{ width: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>{t('companyName')}</label>
                <input required placeholder="Acme Media Corp" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="input-light" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>Contact Name</label>
                  <input required placeholder="Ahmed Ali" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-light" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>{t('phone')}</label>
                  <input required placeholder="+201000000000" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="input-light" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>{t('email')}</label>
                <input type="email" required placeholder="client@company.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-light" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-body)', display: 'block', marginBottom: '6px' }}>{t('password')}</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-light" />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', color: 'var(--text-muted)' }}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-brand" style={{ flex: 1, justifyContent: 'center', padding: '11px 20px' }}>
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

