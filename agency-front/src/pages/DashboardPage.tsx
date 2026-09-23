import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, MoreHorizontal, CheckCircle, Circle, TrendingUp,
  Users, TicketCheck, DollarSign, Sparkles, ArrowUpRight, Calendar,
  Clock, CheckSquare, Star,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Client, ServiceRequest, Invoice } from '../types/api';

/* ─── Colorful client card ─── */
const ClientCard: React.FC<{
  client: Client;
  gradient: string;
  teamCount: number;
  taskCount: number;
  progress: number;
  onClick: () => void;
}> = ({ client, gradient, teamCount, taskCount, progress, onClick }) => {
  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&q=80',
  ];
  return (
    <div
      onClick={onClick}
      style={{
        background: gradient,
        borderRadius: '18px',
        padding: '16px 16px 14px',
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '148px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 32px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
      }}
    >
      {/* TOP ROW: +N circle → overlapping photos → three-dot right */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>

        {/* Avatar stack: +N first, then photos overlapping */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* +N count circle */}
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.28)',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 800, flexShrink: 0,
            zIndex: 3,
          }}>
            +{teamCount}
          </div>
          {/* Photo avatars overlapping left over right */}
          {avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.55)',
                marginLeft: '-9px',
                objectFit: 'cover',
                zIndex: 2 - i,
                position: 'relative',
              }}
            />
          ))}
        </div>

        {/* Plain three-dot — no background box */}
        <button
          onClick={e => e.stopPropagation()}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: 'pointer', color: 'rgba(255,255,255,0.75)',
            display: 'flex', alignItems: 'center',
            lineHeight: 1,
          }}
        >
          <MoreHorizontal style={{ width: '20px', height: '20px' }} />
        </button>
      </div>

      {/* MIDDLE: Company name — flex-grow fills space */}
      <h3 style={{
        fontSize: '18px', fontWeight: 900, margin: '0',
        lineHeight: '1.25', letterSpacing: '-0.3px', flex: 1,
      }}>
        {client.companyName}
      </h3>

      {/* BOTTOM: tasks · % + thin progress bar */}
      <div style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.80, display: 'block', marginBottom: '6px' }}>
          {taskCount} tasks · {progress}%
        </span>
        <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '99px', background: 'rgba(255,255,255,0.85)', transition: 'width 0.6s ease' }} />
        </div>
      </div>
    </div>
  );
};

/* ─── Calendar / Schedule event ─── */
const ScheduleEvent: React.FC<{
  time: string; category: string; title: string; color: string;
}> = ({ time, category, title, color }) => (
  <div className="cal-event">
    <span className="cal-time">{time}</span>
    <div className="cal-bar" style={{ background: color }} />
    <div>
      <div className="cal-meta">{category}</div>
      <div className="cal-title">{title}</div>
    </div>
  </div>
);

/* ─── Main Dashboard ─── */
export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, r, i] = await Promise.all([
        api.getClients().catch(() => []),
        api.getRequests().catch(() => []),
        api.getInvoices().catch(() => [])
      ]);
      setClients(c);
      setRequests(r);
      setInvoices(i);
    } catch {
      // Safe fallback
    } finally { setLoading(false); }
  };

  const firstName = user?.name?.split(' ')[0] || 'Team';
  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
  const activeRequests = requests.filter(r => ['submitted', 'in_progress', 'in_review'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'completed');

  const CARD_GRADIENTS = [
    'linear-gradient(135deg, #6B47B8 0%, #9174D4 100%)',
    'linear-gradient(135deg, #35B5B1 0%, #56CEC9 100%)',
    'linear-gradient(135deg, #F07C58 0%, #FF6B47 100%)',
  ];
  const CARD_PROGRESS = [96, 48, 73];
  const CARD_TASKS = [10, 12, 22];
  const CARD_TEAMS = [7, 9, 3];

  const featuredClients = clients.slice(0, 3);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--brand)' }}>
        <Sparkles style={{ width: '24px', marginRight: '10px', animation: 'spin 1s linear infinite' }} />
        <span style={{ fontWeight: 700 }}>{t('loading')}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100%', flexWrap: 'wrap' }}>

      {/* ── CENTER: main content ── */}
      <div style={{ flex: '1 1 600px', minWidth: 0, padding: '24px 20px', overflowY: 'auto' }}>

        {/* ── Header Row ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {t('dashboard')}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              {today}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
            {/* Search box */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px',
              background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)', border: '1.5px solid var(--border)',
            }}>
              <Search style={{ width: '15px', color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                placeholder="Search clients, requests…"
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: '13px', width: '100%', color: 'var(--text-dark)',
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>
            {/* Add button */}
            <button
              onClick={() => navigate('/clients')}
              className="btn-dark"
            >
              <Plus style={{ width: '15px' }} />
              Add New Client
            </button>
          </div>
        </div>

        {/* ── Top KPI cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: t('totalClients'), value: clients.length, icon: Users, color: 'var(--brand)', bg: 'var(--brand-alpha)', change: '+12%' },
            { label: t('activeRequests'), value: activeRequests.length, icon: TicketCheck, color: 'var(--orange)', bg: 'var(--orange-alpha)', change: 'In progress' },
            { label: t('totalRevenue'), value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: 'var(--teal)', bg: 'var(--teal-alpha)', change: 'All time' },
          ].map(({ label, value, icon: Icon, color, bg, change }) => (
            <div key={label} className="surface-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '20px', color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 2px', letterSpacing: '-0.5px' }}>{value}</p>
                <p style={{ fontSize: '11px', color, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ArrowUpRight style={{ width: '11px' }} />{change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Featured Client Cards ── */}
        {featuredClients.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                Active Projects
              </h2>
              <button
                onClick={() => navigate('/clients')}
                style={{
                  background: 'none', border: 'none', fontSize: '13px', fontWeight: 700,
                  color: 'var(--brand)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                View All <ArrowUpRight style={{ width: '13px' }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {featuredClients.map((client, idx) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  gradient={CARD_GRADIENTS[idx]}
                  teamCount={CARD_TEAMS[idx]}
                  taskCount={CARD_TASKS[idx]}
                  progress={CARD_PROGRESS[idx]}
                  onClick={() => navigate('/requests')}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Lower section: Tasks | Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Tasks for today */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 16px' }}>
              {t('tasksForToday')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeRequests.slice(0, 4).map((req, idx) => {
                const colors = ['var(--orange)', 'var(--brand)', 'var(--teal)', 'var(--green)'];
                const colorNames = ['task-row-orange', 'task-row-purple', 'task-row-teal', 'task-row-green'];
                return (
                  <div
                    key={req.id}
                    className={`task-row ${colorNames[idx % 4]}`}
                    onClick={() => navigate('/requests')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 3px', color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.title}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                        {req.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      border: `2px solid ${colors[idx % 4]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {req.status === 'completed'
                        ? <CheckCircle style={{ width: '14px', color: 'var(--green)' }} />
                        : <Circle style={{ width: '14px', color: colors[idx % 4], opacity: 0.5 }} />
                      }
                    </div>
                  </div>
                );
              })}
              {activeRequests.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No active tasks today
                </div>
              )}
            </div>
          </div>

          {/* Statistics column */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 16px' }}>
              Statistics
            </h2>

            {/* Stat boxes row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              {[
                { label: 'Tracked\ntime', value: `${activeRequests.length * 8}h`, icon: Clock, color: 'var(--brand)' },
                { label: 'Finished\ntasks', value: completedRequests.length, icon: CheckSquare, color: 'var(--teal)' },
                { label: 'Pending\ninvoices', value: invoices.filter(i => i.status === 'pending').length, icon: Star, color: 'var(--orange)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="stat-box" style={{ padding: '14px 10px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                    {value}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0, fontWeight: 600, whiteSpace: 'pre-line' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Featured upgrade / revenue card */}
            <div style={{
              background: 'var(--brand-alpha)',
              borderRadius: '18px', padding: '18px',
              border: '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--brand)', margin: '0 0 2px', letterSpacing: '-0.5px' }}>
                  ${(totalRevenue / 1000).toFixed(1)}k
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '6px' }}>total</span>
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 4px' }}>
                  Agency Revenue
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                  Across all active retainers
                </p>
              </div>
              <div style={{ width: '52px', height: '52px', flexShrink: 0 }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'var(--brand-alpha)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUp style={{ width: '24px', color: 'var(--brand)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Calendar / Schedule ── */}
      <div style={{
        flex: '1 1 260px',
        maxWidth: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '20px 20px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '16px', color: 'var(--brand)' }} />
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-dark)' }}>Schedule</span>
          </div>
        </div>

        <div style={{ padding: '16px 20px', flex: 1 }}>

          {/* Day 1 */}
          <div className="cal-day-label">
            {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <ScheduleEvent time="10:00" category="Design" title="Brand Review" color="var(--brand)" />
          <ScheduleEvent time="13:30" category="Strategy" title="Client Kickoff" color="var(--teal)" />
          <ScheduleEvent time="15:00" category="Finance" title="Invoice Follow-up" color="var(--orange)" />

          {/* Day 2 */}
          <div className="cal-day-label" style={{ marginTop: '14px' }}>
            {new Date(Date.now() + 86400000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <ScheduleEvent time="09:00" category="UX Research" title="Wireframe Review" color="var(--brand)" />
          <ScheduleEvent time="11:00" category="Content" title="Copywriting" color="var(--teal)" />
          <ScheduleEvent time="14:30" category="Design" title="Motion Assets" color="var(--orange)" />

          {/* Day 3 */}
          <div className="cal-day-label" style={{ marginTop: '14px' }}>
            {new Date(Date.now() + 172800000).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          {invoices.filter(i => i.status === 'pending').slice(0, 2).map((inv) => (
            <ScheduleEvent
              key={inv.id}
              time="DUE"
              category="Invoice"
              title={`$${inv.amount.toLocaleString()} Due`}
              color="var(--red)"
            />
          ))}
          <ScheduleEvent time="16:00" category="Team" title="Sprint Planning" color="var(--green)" />
        </div>
      </div>

    </div>
  );
};

