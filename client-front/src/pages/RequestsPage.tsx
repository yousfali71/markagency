import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  TicketCheck, Plus, UploadCloud, Send, X, Image as ImageIcon, ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { clientApi } from '../services/api';
import type { ServiceRequest, Service, RequestPriority } from '../types/api';

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  submitted:   { bg: 'var(--brand-alpha)',  color: 'var(--brand)' },
  in_review:   { bg: 'var(--yellow-alpha)', color: '#9A7010' },
  in_progress: { bg: 'rgba(78,205,196,0.1)', color: 'var(--brand-dark)' },
  done:        { bg: 'var(--green-alpha)',  color: 'var(--green)' },
  completed:   { bg: 'var(--green-alpha)',  color: 'var(--green)' },
  rejected:    { bg: 'var(--red-alpha)',    color: 'var(--red)' },
};

export const RequestsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const clientId = 'client-acme';
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', serviceId: '', priority: 'medium' as RequestPriority });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [commentText, setCommentText] = useState('');

  const loadData = async () => {
    const [r, s] = await Promise.all([clientApi.getMyRequests(clientId), clientApi.getServices()]);
    setRequests(r); setServices(s);
    if (s.length > 0 && !form.serviceId) setForm(p => ({ ...p, serviceId: s[0].id }));
    if (selectedReq) { const u = r.find(x => x.id === selectedReq.id); if (u) setSelectedReq(u); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await clientApi.createRequest({ title: form.title, description: form.description, serviceId: form.serviceId, priority: form.priority, clientId, attachmentsFiles: selectedFiles });
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    setShowModal(false);
    setForm({ title: '', description: '', serviceId: services[0]?.id || '', priority: 'medium' });
    setSelectedFiles([]);
    loadData();
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedReq || !user) return;
    await clientApi.addComment(selectedReq.id, commentText, user);
    setCommentText(''); loadData();
  };

  return (
    <div style={{ padding: '24px 16px' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('requestsTitle')}</h1>
          <p className="page-sub">Submit design tasks, revisions, and communicate with your agency team</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-brand">
          <Plus style={{ width: '15px' }} />
          {t('newRequestTitle')}
        </button>
      </div>

      {/* Requests list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {requests.map((req, idx) => {
          const badge = STATUS_BADGE[req.status] || STATUS_BADGE.submitted;
          const borderColors = ['var(--brand)', 'var(--brand-dark)', 'var(--orange)', 'var(--green)'];
          return (
            <div
              key={req.id}
              onClick={() => setSelectedReq(req)}
              className="surface-card"
              style={{
                padding: '16px 18px', cursor: 'pointer', borderLeft: `4px solid ${borderColors[idx % 4]}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                {/* Left: icon + info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <TicketCheck style={{ width: '18px', color: badge.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 4px', letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.title}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px', fontFamily: 'monospace' }}>
                      {req.id.substring(0, 18)} · {req.service?.name}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                      {req.description}
                    </p>
                  </div>
                </div>

                {/* Right: badge */}
                <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: badge.bg, color: badge.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {req.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span>{req.attachments?.length || 0} attachments</span>
                  <span>{req.comments?.length || 0} comments</span>
                </div>
                <ChevronRight style={{ width: '15px', color: badge.color }} />
              </div>
            </div>
          );
        })}

        {requests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-xs)' }}>
            <TicketCheck style={{ width: '32px', marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', margin: 0 }}>No requests yet — submit your first one!</p>
          </div>
        )}
      </div>

      {/* Modal: New Request */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="surface-card" style={{ width: '92vw', maxWidth: '540px', padding: '24px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>{t('newRequestTitle')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px' }} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('requestTitle')}</label>
                <input required placeholder="5 Instagram Story Designs for Autumn Launch" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('selectService')}</label>
                  <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} className="input-light">
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('priorityLevel')}</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as RequestPriority })} className="input-light">
                    <option value="low">{t('priority_low')}</option>
                    <option value="medium">{t('priority_medium')}</option>
                    <option value="high">{t('priority_high')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('requestDescription')}</label>
                <textarea required rows={3} placeholder="Describe your design specifications, dimensions, color preferences…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-light" style={{ resize: 'vertical' }} />
              </div>

              {/* File upload */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('uploadAttachments')}</label>
                <div style={{ position: 'relative', border: '2px dashed var(--border-dark)', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-body)', transition: 'border-color 0.15s' }}>
                  <input type="file" multiple onChange={e => e.target.files && setSelectedFiles(Array.from(e.target.files))} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  <UploadCloud style={{ width: '24px', color: 'var(--brand)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-body)', margin: 0 }}>{t('dragDropFiles')}</p>
                  {selectedFiles.length > 0 && <p style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 700, marginTop: '6px' }}>{selectedFiles.length} file(s) selected</p>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', color: 'var(--text-muted)' }}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-brand" style={{ flex: 1, justifyContent: 'center', padding: '11px 20px' }}>
                  {t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Right drawer: request details */}
      {selectedReq && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end', background: 'rgba(28,27,59,0.25)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '500px', height: '100%', background: 'white', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--brand-dark)', fontWeight: 700, fontFamily: 'monospace', background: 'var(--brand-alpha)', padding: '3px 8px', borderRadius: '6px' }}>{selectedReq.id}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)', margin: '10px 0 0', letterSpacing: '-0.3px' }}>{selectedReq.title}</h2>
              </div>
              <button onClick={() => setSelectedReq(null)} style={{ background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', cursor: 'pointer', flexShrink: 0, marginLeft: '12px' }}>
                <X style={{ width: '16px', color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Description</h3>
                <div style={{ background: 'var(--bg-body)', borderRadius: '12px', padding: '14px', fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.6', border: '1px solid var(--border)' }}>
                  {selectedReq.description}
                </div>
              </div>

              {/* Attachments */}
              {(selectedReq.attachments || []).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Attachments</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {selectedReq.attachments?.map(att => (
                      <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                        <ImageIcon style={{ width: '16px', color: 'var(--brand)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Discussion</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {(selectedReq.comments || []).length === 0
                    ? <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', background: 'var(--bg-body)', borderRadius: '12px' }}>No comments yet — start the conversation!</p>
                    : selectedReq.comments?.map(c => (
                      <div key={c.id} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-body)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-dark)' }}>{c.user?.name || c.userId}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-placeholder)' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: 0, lineHeight: '1.5' }}>{c.message}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Comment input */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'white' }}>
              <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Write a comment or feedback…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="input-light"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-brand" style={{ padding: '11px 16px', flexShrink: 0 }}>
                  <Send style={{ width: '15px' }} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
