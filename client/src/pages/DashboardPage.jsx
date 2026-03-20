import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import {
  getActivePolicy, getMyPayouts, getRecentTriggers,
  getWeatherData, getAQIData, getRiskScore, TRIGGER_TYPES,
} from '../services/api.js';
import {
  Shield, Wallet, TrendingUp, CloudRain, Thermometer,
  Wind, AlertTriangle, Zap, Clock, ChevronRight, Activity, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pol, pay, trig, w, a, rs] = await Promise.all([
          getActivePolicy(user._id),
          getMyPayouts(user._id),
          getRecentTriggers(),
          getWeatherData(user.activeZone),
          getAQIData(user.activeZone),
          getRiskScore(user.activeZone, user.city, user.avgDailyHours),
        ]);
        setPolicy(pol);
        setPayouts(pay);
        setTriggers(trig.slice(0, 5));
        setWeather(w);
        setAqi(a);
        setRiskScore(rs);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const totalPayouts = payouts.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Welcome back, {user.name?.split(' ')[0]}</h1>
        <p>Here's what's happening with your coverage today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<Shield size={20} />}
          label="Active Plan"
          value={policy ? policy.planType.charAt(0).toUpperCase() + policy.planType.slice(1) : 'None'}
          subText={policy ? `₹${policy.finalPremium}/week` : ''}
          delay={1}
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Total Payouts"
          value={`₹${totalPayouts.toLocaleString()}`}
          subText={`${payouts.length} successful payments`}
          trend="up"
          delay={2}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Risk Adjustment"
          value={riskScore >= 0 ? `+${(riskScore * 100).toFixed(0)}%` : `${(riskScore * 100).toFixed(0)}%`}
          subText="Based on your location"
          trend={riskScore > 0 ? 'up' : riskScore < 0 ? 'down' : 'neutral'}
          delay={3}
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Logged Hours"
          value={`${user.avgDailyHours}h`}
          subText="Daily average this week"
          trend="neutral"
          delay={4}
        />
      </div>

      <div className="dashboard-grid">
        {/* Environmental Monitor */}
        <div className="glass-card env-card animate-fade-in delay-2">
          <div className="card-header">
            <h3>Zone Conditions</h3>
            <span className="badge badge-emerald">Live</span>
          </div>
          <div className="env-grid">
            {weather && (
              <>
                <div className="env-item">
                  <div className="env-icon-box"><CloudRain size={20} /></div>
                  <div className="env-info">
                    <span className="env-value">{weather.rainfall_mm} mm/hr</span>
                    <span className="env-label">Rainfall</span>
                  </div>
                  {weather.rainfall_mm > 50 && <span className="env-tag red">Heavy Rain</span>}
                </div>
                <div className="env-item">
                  <div className="env-icon-box"><Thermometer size={20} /></div>
                  <div className="env-info">
                    <span className="env-value">{weather.temperature}°C</span>
                    <span className="env-label">Temperature</span>
                  </div>
                  {weather.temperature > 42 && <span className="env-tag red">Extreme Heat</span>}
                </div>
                <div className="env-item">
                  <div className="env-icon-box"><Wind size={20} /></div>
                  <div className="env-info">
                    <span className="env-value">{weather.wind_kph} km/h</span>
                    <span className="env-label">Wind</span>
                  </div>
                </div>
              </>
            )}
            {aqi && (
              <div className="env-item">
                <div className="env-icon-box" style={{ background: `${aqi.color}22`, color: aqi.color }}><AlertTriangle size={20} /></div>
                <div className="env-info">
                  <span className="env-value">AQI {aqi.aqi}</span>
                  <span className="env-label">Air Quality</span>
                </div>
                {aqi.aqi > 300 && <span className="env-tag red">Severe AQI</span>}
              </div>
            )}
          </div>
        </div>

        {/* Policy Card */}
        <div className="glass-card policy-overview animate-fade-in delay-3">
          <div className="card-header">
            <h3>Subscription Overview</h3>
          </div>
          {policy ? (
            <div className="policy-details">
              <div className="policy-plan-name">
                {policy.planType.charAt(0).toUpperCase() + policy.planType.slice(1)} Shield
              </div>
              
              <div className="policy-stats-list">
                <div className="stat-row">
                  <div className="stat-col">
                    <span className="label">Weekly Premium</span>
                    <span className="value">₹{policy.finalPremium}</span>
                  </div>
                  <div className="stat-col">
                    <span className="label">Max Daily Payout</span>
                    <span className="value">₹{policy.maxDailyPayout}</span>
                  </div>
                </div>
                <div className="stat-row">
                  <div className="stat-col">
                    <span className="label">Max Weekly Limit</span>
                    <span className="value">₹{policy.maxWeeklyPayout}</span>
                  </div>
                  <div className="stat-col">
                    <span className="label">Used This Week</span>
                    <span className="value orange">₹{policy.payoutsThisWeek}</span>
                  </div>
                </div>
              </div>

              <div className="policy-footer">
                <div className="policy-week">
                  <Clock size={16} /> Ends on {new Date(policy.weekEnd).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
                <Link to="/plans" className="btn btn-secondary btn-sm">Manage Plan</Link>
              </div>
            </div>
          ) : (
            <div className="no-policy">
              <div className="icon-wrap"><Shield size={32} /></div>
              <h3>No Active Subscription</h3>
              <p>Protect your earnings starting at ₹29/week.</p>
              <Link to="/plans" className="btn btn-primary" style={{marginTop: '16px'}}>View Plans <ChevronRight size={16} /></Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Triggers */}
      <div className="glass-card triggers-section animate-fade-in delay-4">
        <div className="card-header">
          <h3>Recent Network Disruptions</h3>
          <Link to="/payouts" className="view-all">View Payouts <ChevronRight size={14} /></Link>
        </div>
        <div className="trigger-list">
          {triggers.map((t, i) => {
            const conf = TRIGGER_TYPES[t.type] || {};
            return (
              <div key={t._id} className="trigger-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="trigger-icon">{conf.icon || '⚡'}</div>
                <div className="trigger-info">
                  <span className="trigger-name">{conf.label || t.type}</span>
                  <span className="trigger-meta">{t.city} (Zone {t.zone})</span>
                </div>
                <div className="trigger-stats">
                  <span className="badge badge-emerald">{t.payoutsIssued} payouts issued</span>
                </div>
                <div className="trigger-time">{timeAgo(t.timestamp)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .dashboard { max-width: 1100px; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Stat Card */
        .stat-card {
          padding: 24px;
          display: flex; align-items: flex-start; gap: 16px;
        }
        .stat-icon-wrap {
          width: 48px; height: 48px; border-radius: 50%;
          background: var(--accent-orange-light);
          color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-body { flex: 1; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 2px 0; }
        .stat-footer { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .trend-icon { display: flex; align-items: center; justify-content: center; }
        .trend-icon.up { color: var(--accent-emerald); }
        .trend-icon.down { color: var(--accent-red); }
        .trend-icon.neutral { color: var(--text-muted); }
        .stat-sub { font-size: 0.8rem; color: var(--text-secondary); }

        /* Env Card */
        .env-card { padding: 28px; }
        .env-grid {
          display: grid; grid-template-columns: 1fr;
          gap: 16px;
        }
        .env-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px; border-radius: var(--radius-md);
          background: #F9FAFB; border: 1px solid var(--border-subtle);
        }
        .env-icon-box {
          width: 40px; height: 40px; border-radius: 12px;
          background: #FFFFFF; color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--shadow-sm);
        }
        .env-info { flex: 1; display: flex; flex-direction: column; }
        .env-value { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
        .env-label { font-size: 0.8rem; color: var(--text-secondary); }
        .env-tag {
          padding: 4px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 600;
        }
        .env-tag.red { background: var(--accent-red-light); color: var(--accent-red); }

        /* Policy Overview */
        .policy-overview { padding: 28px; }
        .policy-plan-name {
          font-size: 1.5rem; font-weight: 700; color: var(--primary);
          margin-bottom: 24px;
        }
        .policy-stats-list {
          display: flex; flex-direction: column; gap: 16px;
        }
        .stat-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .stat-col {
          display: flex; flex-direction: column; gap: 4px;
          padding: 16px; background: #F9FAFB; border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }
        .stat-col .label { font-size: 0.8rem; color: var(--text-secondary); }
        .stat-col .value { font-size: 1.2rem; font-weight: 600; color: var(--text-primary); }
        .stat-col .value.orange { color: var(--primary); }
        
        .policy-footer {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-light);
        }
        .policy-week {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.9rem; color: var(--text-secondary); font-weight: 500;
        }
        
        .no-policy {
          text-align: center; padding: 40px 20px;
        }
        .no-policy .icon-wrap {
          width: 64px; height: 64px; border-radius: 50%;
          background: #F3F4F6; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .no-policy h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 8px; }
        .no-policy p { color: var(--text-secondary); font-size: 0.95rem; }

        /* Triggers */
        .triggers-section { padding: 28px; }
        .view-all {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.85rem; font-weight: 500;
        }
        .trigger-list { display: flex; flex-direction: column; }
        .trigger-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid var(--border-subtle);
          animation: fadeInUp 0.4s ease forwards; opacity: 0;
        }
        .trigger-row:last-child { border-bottom: none; padding-bottom: 0; }
        .trigger-icon {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          background: #F9FAFB; display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem; border: 1px solid var(--border-light);
        }
        .trigger-info { flex: 1; }
        .trigger-name { display: block; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
        .trigger-meta { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }
        .trigger-stats { padding: 0 16px; }
        .trigger-time { font-size: 0.85rem; color: var(--text-muted); min-width: 80px; text-align: right; }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, subText, trend, delay = 0 }) {
  return (
    <div className={`glass-card stat-card animate-fade-in delay-${delay}`}>
      <div className="stat-icon-wrap">{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        <div className="stat-footer">
          {trend && (
            <span className={`trend-icon ${trend}`}>
              {trend === 'up' && <ArrowUpRight size={14} />}
              {trend === 'down' && <ArrowDownRight size={14} />}
              {trend === 'neutral' && <Minus size={14} />}
            </span>
          )}
          <span className="stat-sub">{subText}</span>
        </div>
      </div>
    </div>
  );
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
