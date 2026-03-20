import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  purchasePolicy, getActivePolicy, getRiskScore,
  PLAN_CONFIG,
} from '../services/api.js';
import {
  Shield, Check, Star, Zap, TrendingUp, Loader2,
  AlertCircle, ChevronRight
} from 'lucide-react';

const PLAN_FEATURES = {
  basic: [
    '₹200 max payout per day',
    '₹800 max payout per week',
    'Rain & heat triggers',
    'UPI instant payout',
  ],
  standard: [
    '₹300 max payout per day',
    '₹1,200 max payout per week',
    'All 5 trigger types',
    'UPI instant payout',
    'Priority fraud clearance',
  ],
  full: [
    '₹450 max payout per day',
    '₹1,800 max payout per week',
    'All 5 trigger types',
    'UPI instant payout',
    'Priority fraud clearance',
    'WhatsApp alerts',
    'Dedicated support',
  ],
};

export default function PolicySelectPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePolicy, setActivePolicy] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pol, rs] = await Promise.all([
        getActivePolicy(user._id),
        getRiskScore(user.activeZone, user.city, user.avgDailyHours),
      ]);
      setActivePolicy(pol);
      setRiskScore(rs);
      setLoading(false);
    }
    load();
  }, [user]);

  const handlePurchase = async (planType) => {
    setPurchasing(planType);
    setSuccess(null);
    try {
      const pol = await purchasePolicy(user._id, planType, user);
      setActivePolicy(pol);
      setSuccess(pol);
    } catch (e) {
      console.error(e);
    }
    setPurchasing(null);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="plans-page">
      <div className="page-header">
        <h1>Subscription Plans</h1>
        <p>Weekly income protection plans — auto-renews every Monday</p>
      </div>

      {/* Risk Score Banner */}
      <div className="glass-card risk-banner animate-fade-in">
        <div className="risk-left">
          <div className="risk-icon"><TrendingUp size={20} /></div>
          <div>
            <span className="risk-label">Dynamic Pricing Adjustment</span>
            <span className="risk-value">
              {riskScore >= 0 ? '+' : ''}{(riskScore * 100).toFixed(1)}% premium modifier
            </span>
          </div>
        </div>
        <span className="risk-desc">
          Calculated using your zone ({user.activeZone}) and average daily hours.
        </span>
      </div>

      {success && (
        <div className="glass-card success-banner animate-fade-in">
          <div className="success-icon"><Check size={20} strokeWidth={3} /></div>
          <div>
            <strong>Subscription Activated!</strong>
            <span> You are now covered under the {success.planType.charAt(0).toUpperCase() + success.planType.slice(1)} plan.
            Next billing cycle: {success.weekEnd}</span>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="plans-grid">
        {Object.entries(PLAN_CONFIG).map(([key, plan], i) => {
          const finalPrice = Math.round(plan.basePremium * (1 + riskScore));
          const isActive = activePolicy?.planType === key;
          const isPopular = key === 'standard';

          return (
            <div
              key={key}
              className={`glass-card plan-card animate-fade-in delay-${i + 1} ${isActive ? 'active-plan' : ''}`}
            >
              {isPopular && !isActive && <div className="popular-badge"><Star size={12} fill="currentColor" /> Most Popular</div>}
              {isActive && <div className="active-badge"><Shield size={12} fill="currentColor" strokeWidth={0} /> Current Plan</div>}

              <div className="plan-header">
                <div className="plan-tier">{plan.label}</div>
                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{finalPrice}</span>
                  <span className="period">/week</span>
                </div>
                {riskScore !== 0 && (
                  <div className="plan-base-price">
                    Base: ₹{plan.basePremium} {riskScore > 0 ? `(+₹${finalPrice - plan.basePremium})` : `(-₹${plan.basePremium - finalPrice})`}
                  </div>
                )}
              </div>

              <hr className="plan-divider" />

              <ul className="plan-features">
                {PLAN_FEATURES[key].map((f, j) => (
                  <li key={j}><Check size={16} strokeWidth={3} /> <span>{f}</span></li>
                ))}
              </ul>

              <button
                id={`purchase-${key}`}
                className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'} btn-lg`}
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => handlePurchase(key)}
                disabled={!!purchasing || isActive}
              >
                {purchasing === key ? (
                  <Loader2 size={18} className="spinning" />
                ) : isActive ? (
                  <>Current Subscription</>
                ) : (
                  <>Select Plan</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="plans-note glass-card animate-fade-in delay-4">
        <AlertCircle size={18} />
        <span>Premium is charged every Monday via UPI auto-debit. Coverage applies only while active on your respective delivery platform app. By subscribing, you agree to the Terms of Service.</span>
      </div>

      <style>{`
        .plans-page { max-width: 1040px; }

        .risk-banner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
          border-left: 4px solid var(--accent-orange);
        }
        .risk-left {
          display: flex; align-items: center; gap: 16px;
        }
        .risk-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--accent-orange-light); color: var(--accent-orange);
          display: flex; align-items: center; justify-content: center;
        }
        .risk-label { display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 2px;}
        .risk-value { display: block; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
        .risk-desc { font-size: 0.9rem; color: var(--text-secondary); }

        .success-banner {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 24px; margin-bottom: 32px;
          background: var(--accent-emerald-light);
          border: 1px solid #A7F3D0;
          color: #065F46;
          border-radius: var(--radius-md);
        }
        .success-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: #10B981; color: white;
          display: flex; align-items: center; justify-content: center;
        }
        .success-banner strong { display: block; font-size: 1.05rem; margin-bottom: 2px; }
        .success-banner span { font-size: 0.9rem; }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 800px) {
          .plans-grid { grid-template-columns: 1fr; }
        }

        .plan-card {
          padding: 32px 28px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        .plan-card.active-plan {
          border: 2px solid var(--accent-orange);
          box-shadow: 0 8px 25px rgba(255, 106, 0, 0.15);
        }

        .popular-badge, .active-badge {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 6px;
          padding: 6px 16px; border-radius: 100px;
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.5px; box-shadow: var(--shadow-sm);
        }
        .popular-badge {
          background: #1F2937; color: white;
        }
        .active-badge {
          background: var(--accent-orange); color: white;
        }

        .plan-header { text-align: left; }
        .plan-tier {
          font-size: 1.15rem; font-weight: 700; color: var(--text-primary);
          margin-bottom: 16px; margin-top: 8px;
        }
        .plan-price {
          display: flex; align-items:baseline; margin-bottom: 8px;
        }
        .plan-price .currency { font-size: 1.5rem; font-weight: 600; margin-right: 4px; color: var(--text-primary);}
        .plan-price .amount { font-size: 3rem; font-weight: 800; color: var(--text-primary); letter-spacing: -1px; }
        .plan-price .period { font-size: 1rem; color: var(--text-secondary); margin-left: 4px; }
        .plan-base-price {
          font-size: 0.85rem; color: var(--text-muted);
        }

        .plan-divider {
          border: none; border-top: 1px solid var(--border-light);
          margin: 24px 0;
        }

        .plan-features {
          list-style: none; text-align: left;
          margin: 0 0 32px 0; padding: 0;
          display: flex; flex-direction: column; gap: 16px;
          flex: 1;
        }
        .plan-features li {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 0.95rem; color: var(--text-secondary);
          line-height: 1.4;
        }
        .plan-features li svg { color: var(--accent-orange); flex-shrink: 0; margin-top: 2px;}

        .plans-note {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 20px 24px; font-size: 0.9rem; color: var(--text-secondary);
          background: #F9FAFB;
        }
        .plans-note svg { color: var(--text-muted); flex-shrink: 0; margin-top: 2px;}
        .spinning { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
