import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { clientApi } from '../services/api';
import type { Plan } from '../types/api';

export const PlanPage: React.FC = () => {
  const { t } = useLanguage();

  const clientId = 'client-acme';
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const loadPlansData = async () => {
    try {
      const [apRes, pRes] = await Promise.all([
        clientApi.getActivePlan(clientId),
        clientApi.getAvailablePlans(),
      ]);
      setActivePlan(apRes);
      setPlans(pRes);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPlansData();
  }, []);

  const handleSubscribeRequest = async (planId: string) => {
    await clientApi.requestPlanSubscription(clientId, planId);
    setPendingPlanId(planId);
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div style={{ padding: '24px 16px' }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-[var(--border-glass)]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight gradient-text">{t('myPlan')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Review your active retainer package or upgrade your subscription plan.
          </p>
        </div>
      </div>

      {/* Available Plans Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isActive = activePlan?.id === plan.id;
          const isPending = pendingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`glass-card p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 relative overflow-hidden ${
                isActive ? 'border-blue-500/60 bg-blue-500/5 shadow-xl shadow-blue-500/10' : 'border-[var(--border-glass)] hover:border-blue-500/30'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-2xl">
                  {t('planActive')}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-[var(--border-glass)] text-blue-400 text-xs font-bold uppercase">
                    {plan.billingCycle}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-[var(--text-main)]">{plan.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">{plan.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black gradient-text">${plan.price}</span>
                  <span className="text-xs text-gray-400">/ {plan.billingCycle}</span>
                </div>
              </div>

              {/* Service List */}
              <div className="pt-4 border-t border-[var(--border-glass)] space-y-2 text-xs">
                <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-2">{t('requestQuota')}</p>
                {(plan.services || []).map((srv) => (
                  <div key={srv.id} className="flex items-center gap-2 text-[var(--text-main)]">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{srv.name}</span>
                  </div>
                ))}
              </div>

              {/* Subscription Action Button */}
              <div className="pt-4">
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/30 flex items-center justify-center gap-2 cursor-default"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('currentPlan')}</span>
                  </button>
                ) : isPending ? (
                  <div className="w-full py-3 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-[11px] border border-amber-500/30 text-center flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>{t('planPendingApproval')}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribeRequest(plan.id)}
                    className="w-full py-3 rounded-xl gradient-bg text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity"
                  >
                    {t('requestPlanChange')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
