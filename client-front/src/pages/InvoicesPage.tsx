import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { clientApi } from '../services/api';
import type { Invoice } from '../types/api';

export const InvoicesPage: React.FC = () => {
  const { t } = useLanguage();

  const clientId = 'client-acme';
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await clientApi.getInvoices(clientId);
      setInvoices(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayInvoice = (invId: string) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    alert('Simulating Stripe Payment Gateway integration for invoice ' + invId + '!');
  };

  return (
    <div style={{ padding: '24px 16px' }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-[var(--border-glass)]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">{t('invoicesTitle')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            View billing history, invoice amounts, and complete payments securely.
          </p>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="glass-card rounded-3xl border border-[var(--border-glass)] overflow-hidden responsive-table-container">
        <div className="overflow-x-auto min-w-[600px]">
          <table className="w-full text-left text-xs text-[var(--text-muted)]">
            <thead className="bg-white/5 border-b border-[var(--border-glass)] uppercase text-[10px] font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Invoice Ref</th>
                <th className="px-6 py-4">{t('amountDue')}</th>
                <th className="px-6 py-4">{t('dueDate')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-glass)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/2 transition-colors text-[var(--text-main)]">
                  <td className="px-6 py-4 font-bold">
                    <span className="block font-bold text-sm text-[var(--text-main)] font-mono">{inv.stripeInvoiceId || inv.id}</span>
                    <span className="text-[10px] text-gray-500">Issued: {new Date(inv.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-sm text-blue-400">${inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-300">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                      inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      inv.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {t(`status_${inv.status}` as any)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status === 'paid' ? (
                      <span className="text-emerald-400 text-xs font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayInvoice(inv.id)}
                        className="px-4 py-2 rounded-xl gradient-bg text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity"
                      >
                        {t('payNow')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
