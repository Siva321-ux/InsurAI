import { useState, useEffect } from 'react';
import {
  getAdminDashboard, simulateTrigger, getFraudLogs,
  TRIGGER_TYPES, CITIES_ZONES,
} from '../services/api.js';
import {
  Settings, Users, Shield, Wallet, Zap, AlertTriangle,
  Play, Loader2, ChevronRight, Activity, TrendingUp,
  MapPin, Clock, ArrowUpRight, CheckCircle2
} from 'lucide-react';

export default function AdminPage() {
  const [dash, setDash] = useState(null);
  const [simType, setSimType] = useState('rain');
  const [simCity, setSimCity] = useState('Mumbai');
  const [simZone, setSimZone] = useState('400053');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    const data = await getAdminDashboard();
    setDash(data);
    setLoading(false);
  };

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    const zones = CITIES_ZONES[simCity] || [];
    setSimZone(zones[0] || '');
  }, [simCity]);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const result = await simulateTrigger(simType, simZone, simCity);
      setSimResult(result);
      await loadDashboard(); // refresh stats
    } catch (e) {
      console.error(e);
    }
    setSimulating(false);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const zones = CITIES_ZONES[simCity] || [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Console</h1>
        <p>Monitor system health, manage automated payouts, and view fraud flags.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <AdminStat icon={<Users size={20} />} label="Total Partners" value={dash.totalWorkers.toLocaleString()} color="blue" delay={1} />
        <AdminStat icon={<Shield size={20} />} label="Active Subscriptions" value={dash.activePolicies.toLocaleString()} color="emerald" delay={2} />
        <AdminStat icon={<Wallet size={20} />} label="Total Disbursed" value={`₹${dash.totalPayoutAmount.toLocaleString()}`} color="amber" delay={3} />
        <AdminStat icon={<TrendingUp size={20} />} label="Network Claim Ratio" value={`${dash.claimRatio}%`} color="purple" delay={4} />
      </div>

      <div className="admin-grid">
        {/* Trigger Simulator */}
        <div className="glass-card sim-card animate-fade-in delay-2">
          <div className="card-header">
            <h3>Disruption Simulator</h3>
            <span className="badge badge-orange">Testing Tool</span>
          </div>
          <p className="sim-desc">Manually trigger an environmental or platform disruption to observe the automated payout pipeline.</p>

          <div className="sim-form">
            <div className="input-group">
              <label>Parameter Type</label>
              <select id="sim-type" className="input-field" value={simType} onChange={e => setSimType(e.target.value)}>
                {Object.entries(TRIGGER_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label} ({v.threshold})</option>
                ))}
              </select>
            </div>

            <div className="sim-row">
              <div className="input-group">
                <label>Target City</label>
                <select id="sim-city" className="input-field" value={simCity} onChange={e => setSimCity(e.target.value)}>
                  {Object.keys(CITIES_ZONES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Affected Zone (PIN)</label>
                <select id="sim-zone" className="input-field" value={simZone} onChange={e => setSimZone(e.target.value)}>
                  <option value="ALL">ALL ZONES (City-wide)</option>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <button
              id="sim-fire"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              onClick={handleSimulate}
              disabled={simulating}
            >
              {simulating ? (
                <><Loader2 size={18} className="spinning" /> Pushing Event API...</>
              ) : (
                <><Play size={18} strokeWidth={2} /> Execute Trigger Event</>
              )}
            </button>
          </div>

          {simResult && (
            <div className="sim-result animate-fade-in">
              <div className="sim-result-icon"><CheckCircle2 size={24} color="#10B981" /></div>
              <div className="sim-result-body">
                <strong>Event Processed Automatically</strong>
                <div className="sim-result-stats">
                  <span>{TRIGGER_TYPES[simResult.trigger.type]?.icon} {TRIGGER_TYPES[simResult.trigger.type]?.label} detected</span>
                  <span><MapPin size={14} /> {simResult.trigger.city} — Zone {simResult.trigger.zone}</span>
                  <span><Users size={14} /> {simResult.payoutsProcessed} partner payouts generated</span>
                  <span><AlertTriangle size={14} /> {simResult.fraudExcluded} blocked (fraud checks)</span>
                  <span><Wallet size={14} /> ₹{simResult.trigger.totalPayoutAmount?.toLocaleString()} capital disbursed via UPI</span>
                </div>
                <div className="sim-result-time">
                  <Clock size={12} /> Pipeline execution time: ~1.22s
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Zone Coverage */}
        <div className="glass-card zone-card animate-fade-in delay-3">
          <div className="card-header">
            <h3>Network Coverage Density</h3>
          </div>
          <div className="zone-list">
            {dash.zoneCoverage.map((z, i) => (
              <div key={z.city} className="zone-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="zone-meta-top">
                  <span className="zone-city">{z.city}</span>
                  <span className="zone-count">{z.workers} active</span>
                </div>
                <div className="zone-bar">
                  <div className="zone-bar-fill" style={{ width: `${Math.min(100, (z.workers / 800) * 100)}%` }} />
                </div>
                <div className="zone-meta-bottom">
                  <span>{z.zones} covered PIN codes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Triggers Table */}
      <div className="glass-card triggers-table animate-fade-in delay-3">
        <div className="card-header">
          <h3>System Trigger Log</h3>
        </div>
        <div className="table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Location Context</th>
                <th className="right-align">Affected</th>
                <th className="right-align">Payouts</th>
                <th className="right-align">Capital Traded</th>
                <th className="right-align">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {dash.recentTriggers.map(t => {
                const conf = TRIGGER_TYPES[t.type] || {};
                return (
                  <tr key={t._id}>
                    <td>
                      <div className="trig-type">
                        <span className="trig-icon">{conf.icon}</span> 
                        <span className="trig-label">{conf.label}</span>
                      </div>
                    </td>
                    <td><MapPin size={12} className="inline-icon" /> {t.city} (Zone {t.zone})</td>
                    <td className="right-align">{t.workersAffected.toLocaleString()}</td>
                    <td className="right-align">{t.payoutsIssued.toLocaleString()}</td>
                    <td className="amount-cell right-align">₹{t.totalPayoutAmount?.toLocaleString()}</td>
                    <td className="time-cell right-align">{timeAgo(t.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fraud Logs */}
      <div className="glass-card fraud-section animate-fade-in delay-4">
        <div className="card-header">
          <h3>GPS Fraud Detection Pipeline</h3>
          <span className="badge badge-red">Active</span>
        </div>
        <div className="table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Partner Profile</th>
                <th>Anomaly Type</th>
                <th>Expected Location</th>
                <th>Ping Location</th>
                <th>Pipeline Action</th>
                <th className="right-align">Time</th>
              </tr>
            </thead>
            <tbody>
              {dash.fraudLogs.map(f => (
                <tr key={f._id}>
                  <td><strong>{f.workerName}</strong><br/><span className="sub-id">{f.workerId}</span></td>
                  <td>
                    <span className={`badge ${f.reason === 'gps_spoofing' ? 'badge-red' : 'badge-amber'}`}>
                      {f.reason.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td><span className="loc-chip">Zone {f.expectedZone}</span></td>
                  <td><span className="loc-chip error">Zone {f.actualZone}</span></td>
                  <td>
                    <span className={`badge ${f.action === 'excluded' ? 'badge-amber' : f.action === 'suspended' ? 'badge-red' : 'badge-emerald'}`}>
                      {f.action}
                    </span>
                  </td>
                  <td className="time-cell right-align">{timeAgo(f.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .admin-page { max-width: 1140px; }
        
        .card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .card-header h3 { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }

        .stat-card { padding: 24px; display: flex; align-items: flex-start; gap: 16px; }
        .stat-icon-wrap { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-icon-wrap.blue    { background: #DBEAFE; color: #2563EB; }
        .stat-icon-wrap.emerald { background: var(--accent-emerald-light); color: #059669; }
        .stat-icon-wrap.amber   { background: #FEF3C7; color: #D97706; }
        .stat-icon-wrap.purple  { background: #EDE9FE; color: #8B5CF6; }
        .stat-body { flex: 1; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;}
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-top: 4px; display: block; }

        .admin-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .admin-grid { grid-template-columns: 1fr; }
        }

        /* Simulator */
        .sim-card { padding: 28px; }
        .sim-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5; }
        .sim-form { display: flex; flex-direction: column; gap: 16px; padding: 20px; background: #F9FAFB; border-radius: var(--radius-md); border: 1px solid var(--border-light); }
        .sim-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .sim-result {
          display: flex; gap: 16px;
          margin-top: 24px; padding: 20px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: var(--radius-md);
        }
        .sim-result-body { flex: 1; color: #065F46; }
        .sim-result-body strong { display: block; margin-bottom: 12px; font-size: 1.05rem; }
        .sim-result-stats {
          display: flex; flex-direction: column; gap: 8px;
          font-size: 0.85rem;
        }
        .sim-result-stats span { display: flex; align-items: center; gap: 8px; }
        .sim-result-time {
          display: flex; align-items: center; gap: 6px;
          margin-top: 14px; font-size: 0.75rem; opacity: 0.8;
          padding-top: 12px; border-top: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* Zone Card */
        .zone-card { padding: 28px; }
        .zone-list { display: flex; flex-direction: column; gap: 20px; }
        .zone-meta-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .zone-city { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
        .zone-count { font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); }
        .zone-meta-bottom { padding-top: 6px; font-size: 0.75rem; color: var(--text-muted); }
        .zone-bar {
          height: 8px; border-radius: 4px;
          background: #F3F4F6;
          overflow: hidden;
        }
        .zone-bar-fill {
          height: 100%;
          border-radius: 4px;
          background: var(--primary);
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Tables */
        .triggers-table, .fraud-section { padding: 28px; margin-bottom: 24px; }
        .table-wrap { overflow-x: auto; margin-top: 16px; }
        .admin-data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-data-table th {
          padding: 14px 16px;
          font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--text-muted); background: #F9FAFB;
          border-bottom: 1px solid var(--border-light);
        }
        .admin-data-table td {
          padding: 16px; font-size: 0.9rem;
          border-bottom: 1px solid var(--border-light);
          color: var(--text-primary); vertical-align: middle;
        }
        .admin-data-table tr:hover td { background: #FAFAFA; }
        .admin-data-table tr:last-child td { border-bottom: none; }
        
        .right-align { text-align: right !important; }
        .inline-icon { color: var(--text-muted); display: inline; vertical-align: text-bottom; margin-right: 4px; }
        
        .trig-type { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
        .trig-icon { width: 32px; height: 32px; border-radius: 8px; background: #FFF; border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: var(--shadow-sm); }
        .trig-label { font-weight: 500; }
        
        .amount-cell { color: #059669; font-weight: 600; }
        .time-cell { color: var(--text-muted); font-size: 0.85rem; white-space: nowrap; }
        
        .loc-chip { display: inline-block; padding: 4px 8px; border-radius: 6px; background: #F3F4F6; font-size: 0.8rem; font-family: monospace; }
        .loc-chip.error { background: #FEE2E2; color: #DC2626; }
        .sub-id { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }

        .spinning { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

function AdminStat({ icon, label, value, color, delay }) {
  return (
    <div className={`glass-card stat-card animate-fade-in delay-${delay}`}>
      <div className={`stat-icon-wrap ${color}`}>{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
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
