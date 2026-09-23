import React, { useState, useEffect } from 'react';
import { Plus, Check, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import type { Plan, Service } from '../types/api';

export const CatalogPage: React.FC = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'plans' | 'services'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const [planForm, setPlanForm] = useState({
    name: '',
    price: 1200,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    description: '',
    serviceIds: [] as string[],
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    icon: 'Sparkles',
  });

  const loadData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([api.getPlans(), api.getServices()]);
      setPlans(pRes);
      setServices(sRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createPlan(planForm);
    setShowPlanModal(false);
    setPlanForm({ name: '', price: 1200, billingCycle: 'monthly', description: '', serviceIds: [] });
    loadData();
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createService(serviceForm);
    setShowServiceModal(false);
    setServiceForm({ name: '', description: '', icon: 'Sparkles' });
    loadData();
  };

  return (
    <div style={{ padding: '24px 16px' }} className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-[var(--border-glass)]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">{t('catalog')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Configure subscription tier packages and service capabilities offered to clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-2xl bg-white/5 border border-[var(--border-glass)]">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'plans' ? 'gradient-bg text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('plansCatalog')}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'services' ? 'gradient-bg text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('servicesCatalog')}
            </button>
          </div>

          {activeTab === 'plans' ? (
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addPlan')}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowServiceModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addService')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content: Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="glass-card p-6 rounded-3xl border border-[var(--border-glass)] hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase">
                    {plan.billingCycle}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-[var(--text-main)]">{plan.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black gradient-text">${plan.price}</span>
                  <span className="text-xs text-gray-400">/ {plan.billingCycle}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-glass)] space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t('includedServices')}</p>
                {services.map((srv) => (
                  <div key={srv.id} className="flex items-center gap-2 text-xs text-[var(--text-main)]">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{srv.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Services */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((srv) => (
            <div key={srv.id} className="glass-card p-5 rounded-3xl border border-[var(--border-glass)] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[var(--text-main)]">{srv.name}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{srv.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-[var(--border-glass)] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
              <h3 className="font-extrabold text-lg gradient-text">{t('addPlan')}</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Package Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth Pro Tier"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-[var(--border-glass)] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">{t('price')} ($)</label>
                  <input
                    type="number"
                    required
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-[var(--border-glass)] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">{t('billingCycle')}</label>
                  <select
                    value={planForm.billingCycle}
                    onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value as any })}
                    className="w-full bg-white/5 border border-[var(--border-glass)] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="monthly" className="bg-slate-900">{t('monthly')}</option>
                    <option value="yearly" className="bg-slate-900">{t('yearly')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-[var(--border-glass)] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-bg text-white font-bold shadow-lg shadow-indigo-500/25"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Service */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-[var(--border-glass)] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-glass)] pb-4">
              <h3 className="font-extrabold text-lg gradient-text">{t('addService')}</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">{t('serviceName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TikTok Ads Production"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-[var(--border-glass)] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Service Description</label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-[var(--border-glass)] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gradient-bg text-white font-bold shadow-lg shadow-indigo-500/25"
                >
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
