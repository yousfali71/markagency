import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Plus, Calendar, X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { Deliverable, Client, Service } from '../types/api';

export const DeliverablesPage: React.FC = () => {
  const { t } = useLanguage();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: 'client-acme', serviceId: 'srv-1',
    title: '', description: '', fileUrl: '',
    completedAt: new Date().toISOString().substring(0, 10),
  });

  const loadData = async () => {
    try {
      const [d, c, s] = await Promise.all([
        api.getDeliverables().catch(() => []),
        api.getClients().catch(() => []),
        api.getServices().catch(() => [])
      ]);
      setDeliverables(d); setClients(c); setServices(s);
    } catch {
      setDeliverables([]); setClients([]); setServices([]);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.logDeliverable(form);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    setShowModal(false);
    setForm({ clientId: 'client-acme', serviceId: 'srv-1', title: '', description: '', fileUrl: '', completedAt: new Date().toISOString().substring(0, 10) });
    loadData();
  };

  const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511225317751-5c2d61e438f5?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div style={{ padding: '24px 16px' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('deliverables')}</h1>
          <p className="page-sub">Log completed assets, design files, and media deliverables</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-dark">
          <Plus style={{ width: '15px' }} />
          {t('logDeliverable')}
        </button>
      </div>

      {/* Grid of deliverable cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {deliverables.map((item, idx) => (
          <div
            key={item.id}
            className="surface-card"
            style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'; }}
          >
            {/* Image */}
            <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
              <img
                src={item.fileUrl || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Client badge overlay */}
              <div style={{
                position: 'absolute', top: '12px', left: '12px',
                background: 'rgba(255,255,255,0.9)', borderRadius: '99px',
                padding: '4px 10px', fontSize: '11px', fontWeight: 700,
                color: 'var(--text-dark)', backdropFilter: 'blur(8px)',
              }}>
                {item.client?.companyName || item.clientId}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '16px 18px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  <Calendar style={{ width: '13px' }} />
                  {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--green)', fontSize: '12px', fontWeight: 700 }}>
                  <CheckCircle2 style={{ width: '13px' }} />
                  Delivered
                </div>
              </div>
            </div>
          </div>
        ))}

        {deliverables.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '20px', boxShadow: 'var(--shadow-xs)' }}>
            <CheckCircle2 style={{ width: '32px', marginBottom: '12px', opacity: 0.4 }} />
            <p style={{ fontSize: '14px', margin: 0 }}>No deliverables logged yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="surface-card" style={{ width: '92vw', maxWidth: '500px', padding: '24px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>{t('logNewDeliverable')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('companyName')}</label>
                  <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="input-light">
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('serviceName')}</label>
                  <select value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} className="input-light">
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('deliverableTitle')}</label>
                <input required placeholder="Q4 Motion Graphics Export" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>Asset URL</label>
                <input type="url" placeholder="https://images.unsplash.com/…" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="input-light" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>Description</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-light" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '11px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', color: 'var(--text-muted)' }}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-dark" style={{ flex: 1, justifyContent: 'center', padding: '11px 20px' }}>
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
