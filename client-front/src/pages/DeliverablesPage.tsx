import React, { useState, useEffect } from 'react';
import { Download, Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { clientApi } from '../services/api';
import type { Deliverable } from '../types/api';

export const DeliverablesPage: React.FC = () => {
  const { t } = useLanguage();

  const clientId = 'client-acme';
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    loadDeliverables();
  }, []);

  const loadDeliverables = async () => {
    try {
      const data = await clientApi.getDeliverables(clientId);
      setDeliverables(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: '24px 16px' }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-[var(--border-glass)]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">{t('deliverablesTitle')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('deliverablesSub')}</p>
        </div>
      </div>

      {/* Media Assets Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliverables.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center rounded-3xl border border-[var(--border-glass)]">
            <p className="text-sm text-gray-400">{t('noDeliverables')}</p>
          </div>
        ) : (
          deliverables.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-3xl border border-[var(--border-glass)] overflow-hidden flex flex-col justify-between hover:border-blue-500/40 transition-all space-y-4"
            >
              <div className="relative h-48 bg-white/5">
                <img
                  src={item.fileUrl || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full glass-panel text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Delivered</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-extrabold text-base text-[var(--text-main)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.description}</p>
                <div className="pt-3 border-t border-[var(--border-glass)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                  </div>

                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-md shadow-blue-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('downloadAsset')}</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
