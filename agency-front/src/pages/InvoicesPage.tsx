import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Plus, X, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { Invoice, Client, InvoiceStatus } from '../types/api';

const STATUS_BADGE: Record<InvoiceStatus, { bg: string; color: string; label: string }> = {
  pending: { bg: 'var(--yellow-alpha)', color: '#9A7010', label: 'Pending' },
  paid:    { bg: 'var(--green-alpha)',  color: 'var(--green)', label: 'Paid' },
  overdue: { bg: 'var(--red-alpha)',    color: 'var(--red)',   label: 'Overdue' },
};

export const InvoicesPage: React.FC = () => {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: 'client-acme', amount: 1850,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
    status: 'pending' as InvoiceStatus,
    stripeInvoiceId: 'in_1Mxyz987654',
  });

  const loadData = async () => {
    try {
      const [i, c] = await Promise.all([
        api.getInvoices().catch(() => []),
        api.getClients().catch(() => [])
      ]);
      setInvoices(i); setClients(c);
    } catch {
      setInvoices([]); setClients([]);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createInvoice(form);
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
    setShowModal(false); loadData();
  };

  const handleStatusUpdate = async (id: string, status: InvoiceStatus) => {
    await api.updateInvoiceStatus(id, status);
    if (status === 'paid') confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    loadData();
  };

  const totalPaid    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ padding: '24px 16px' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">{t('invoices')}</h1>
          <p className="page-sub">Issue invoices, track payments, and manage billing records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-dark">
          <Plus style={{ width: '15px' }} />
          {t('issueInvoice')}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: t('status_paid'), value: totalPaid, icon: TrendingUp, bg: 'var(--green-alpha)', color: 'var(--green)' },
          { label: t('status_pending'), value: totalPending, icon: Clock, bg: 'var(--yellow-alpha)', color: '#9A7010' },
          { label: t('status_overdue'), value: totalOverdue, icon: AlertCircle, bg: 'var(--red-alpha)', color: 'var(--red)' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="surface-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: '20px', color }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.5px' }}>${value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices table */}
      <div className="surface-card responsive-table-container">
        <div style={{ overflowX: 'auto', minWidth: '600px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>{t('companyName')}</th>
                <th style={{ textAlign: 'left' }}>{t('amount')}</th>
                <th style={{ textAlign: 'left' }}>{t('dueDate')}</th>
                <th style={{ textAlign: 'left' }}>{t('invoiceStatus')}</th>
                <th style={{ textAlign: 'right' }}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const badge = STATUS_BADGE[inv.status] || STATUS_BADGE.pending;
                return (
                  <tr key={inv.id}>
                    <td style={{ borderRadius: '14px 0 0 14px' }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '14px', color: 'var(--text-dark)' }}>{inv.client?.companyName || inv.clientId}</p>
                      <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{inv.stripeInvoiceId || inv.id}</p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <DollarSign style={{ width: '14px', color: 'var(--brand)' }} />
                        <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--brand)', letterSpacing: '-0.3px' }}>{inv.amount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-body)' }}>
                      {new Date(inv.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', borderRadius: '0 14px 14px 0' }}>
                      <select
                        value={inv.status}
                        onChange={e => handleStatusUpdate(inv.id, e.target.value as InvoiceStatus)}
                        style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '7px 10px', fontSize: '12px', fontWeight: 700, fontFamily: 'Outfit, sans-serif', background: 'var(--bg-body)', color: 'var(--text-dark)', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No invoices found — issue your first invoice above.
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
          <div className="surface-card" style={{ width: '92vw', maxWidth: '440px', padding: '24px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>{t('issueInvoice')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: '18px' }} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('companyName')}</label>
                <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="input-light">
                  {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('amount')} ($)</label>
                <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="input-light" />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-body)' }}>{t('dueDate')}</label>
                <input type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-light" />
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
