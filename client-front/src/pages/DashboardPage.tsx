import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, TicketCheck, FolderCheck, FileText, CreditCard,
  ArrowUpRight, AlertCircle, ChevronRight, CheckCircle, Circle,
  Sparkles, Calendar, Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { clientApi } from '../services/api';
import type { Plan, ServiceRequest, Deliverable, Invoice } from '../types/api';

const ScheduleEvent: React.FC<{ time: string; category: string; title: string; color: string }> = ({
  time, category, title, color,
}) => (
  <div className="cal-event">
    <span className="cal-time">{time}</span>
    <div className="cal-bar" style={{ background: color }} />
    <div>
      <div className="cal-meta">{category}</div>
      <div className="cal-title">{title}</div>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const clientId = 'client-acme';

  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [p, r, d, i] = await Promise.all([
        clientApi.getActivePlan(clientId),
        clientApi.getMyRequests(clientId),
        clientApi.getDeliverables(clientId),
        clientApi.getInvoices(clientId),
      ]);
      setActivePlan(p); setRequests(r); setDeliverables(d); setInvoices(i);
    } finally { setLoading(false); }
  };

  const firstName = user?.name?.split(' ')[0] || 'Client';
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const activeRequests = requests.filter(r => ['submitted', 'in_progress', 'in_review'].includes(r.status));
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--brand-dark)' }}>
      <Sparkles style={{ width: '22px', marginRight: '10px', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontWeight: 700 }}>{t('loading')}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100%', flexWrap: 'wrap' }}>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: '1 1 600px', minWidth: 0, padding: '24px 20px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {t('dashboard')}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{today}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px', background: 'white', padding: '10px 14px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border)' }}>
              <Search style={{ width: '15px', color: 'var(--text-muted)', flexShrink: 0 }} />
              <input placeholder="Search requests…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', width: '100%', fontFamily: 'Outfit, sans-serif', color: 'var(--text-dark)' }} />
            </div>
            <button onClick={() => navigate('/requests')} className="btn-dark">
              <Plus style={{ width: '15px' }} />
              {t('submitNewRequest')}
            </button>
          </div>
        </div>

        {/* Pending invoice alert */}
        {pendingInvoices.length > 0 && (
          <div style={{ background: 'var(--yellow-alpha)', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid rgba(255,209,102,0.3)', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle style={{ width: '18px', color: '#A07010', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 2px' }}>Invoice Payment Due</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{pendingInvoices.length} invoice(s) awaiting payment</p>
              </div>
            </div>
            <button onClick={() => navigate('/invoices')} style={{ background: 'var(--yellow)', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', color: '#5A3A00' }}>
              View Invoices
            </button>
          </div>
        )}

        {/* KPI stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Active Requests', value: activeRequests.length, color: 'var(--brand)', bg: 'var(--brand-alpha)', icon: TicketCheck },
            { label: 'Deliverables', value: deliverables.length, color: 'var(--green)', bg: 'var(--green-alpha)', icon: FolderCheck },
            { label: 'Invoices', value: invoices.length, color: 'var(--purple)', bg: 'var(--purple-alpha)', icon: FileText },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="surface-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: '20px', color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.5px' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Plan card */}
        <div style={{ background: 'linear-gradient(135deg, #35B5B1 0%, #56CEC9 100%)', borderRadius: '22px', padding: '22px 24px', color: 'white', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 28px rgba(78,205,196,0.35)', position: 'relative', overflow: 'hidden', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Active Plan
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '10px 0 4px', letterSpacing: '-0.5px' }}>
              {activePlan?.name || 'Scale Pro Package'}
            </h2>
            <p style={{ fontSize: '13px', opacity: 0.85, margin: 0 }}>
              ${activePlan?.price || 1850}/mo · {activePlan?.billingCycle || 'monthly'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
            <button onClick={() => navigate('/plan')} style={{ background: 'white', color: 'var(--brand-dark)', border: 'none', borderRadius: '12px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              Manage Plan
            </button>
          </div>
        </div>

        {/* Lower: Tasks + Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Active requests as tasks */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 16px' }}>
              {t('tasksForToday')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeRequests.slice(0, 4).map((req, i) => {
                const colors = ['task-row-teal', 'task-row-purple', 'task-row-orange', 'task-row-green'];
                const dotColors = ['var(--brand)', 'var(--purple)', 'var(--orange)', 'var(--green)'];
                return (
                  <div key={req.id} className={`task-row ${colors[i % 4]}`} onClick={() => navigate('/requests')}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 3px', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{req.status.replace(/_/g, ' ')}</p>
                    </div>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: `2px solid ${dotColors[i % 4]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Circle style={{ width: '10px', color: dotColors[i % 4], opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
              {activeRequests.length === 0 && (
                <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '14px', background: 'white', borderRadius: '14px' }}>
                  No active tasks — great work!
                </div>
              )}
            </div>
          </div>

          {/* Stats + plan feature */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 16px' }}>Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              {[
                { label: 'Tracked\ntime', value: `${activeRequests.length * 6}h` },
                { label: 'Finished\ntasks', value: requests.filter(r => r.status === 'completed').length },
                { label: 'New\nassets', value: deliverables.filter(d => new Date(d.createdAt) > new Date(Date.now() - 7 * 86400000)).length },
              ].map(({ label, value }) => (
                <div key={label} className="stat-box" style={{ padding: '14px 10px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, fontWeight: 600, whiteSpace: 'pre-line' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Recent deliverables mini-grid */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)' }}>{t('deliverablesTitle')}</span>
                <button onClick={() => navigate('/deliverables')} style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 700, color: 'var(--brand-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  View all <ChevronRight style={{ width: '12px' }} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {deliverables.slice(0, 4).map(d => (
                  <img key={d.id} src={d.fileUrl} alt={d.title} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover' }} />
                ))}
                {deliverables.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No deliverables yet</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Schedule ── */}
      <div style={{ flex: '1 1 260px', maxWidth: '100%', background: 'white', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
          <Calendar style={{ width: '16px', color: 'var(--brand)' }} />
          <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-dark)' }}>My Schedule</span>
        </div>
        <div style={{ padding: '16px 20px', flex: 1 }}>
          <div className="cal-day-label">
            {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <ScheduleEvent time="09:30" category="Review" title="Design Feedback" color="var(--brand)" />
          <ScheduleEvent time="11:00" category="Request" title="Submit Revisions" color="var(--orange)" />
          <ScheduleEvent time="14:00" category="Delivery" title="Assets Expected" color="var(--green)" />

          <div className="cal-day-label" style={{ marginTop: '14px' }}>
            {new Date(Date.now() + 86400000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          {pendingInvoices.slice(0, 2).map(inv => (
            <ScheduleEvent key={inv.id} time="DUE" category="Invoice" title={`$${inv.amount.toLocaleString()} Due`} color="var(--red)" />
          ))}
          <ScheduleEvent time="15:00" category="Meeting" title="Progress Review" color="var(--purple)" />

          <div className="cal-day-label" style={{ marginTop: '14px' }}>
            {new Date(Date.now() + 172800000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <ScheduleEvent time="10:00" category="Delivery" title="Final Brand Kit" color="var(--brand)" />
          <ScheduleEvent time="13:00" category="Strategy" title="Retainer Renewal" color="var(--purple)" />
        </div>
      </div>

    </div>
  );
};
