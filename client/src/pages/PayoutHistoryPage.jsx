import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyPayouts, TRIGGER_TYPES } from '../services/api.js';
import {
  Wallet, ArrowDownRight, Clock, CheckCircle2, XCircle,
  Filter, IndianRupee, MapPin
} from 'lucide-react';

export default function PayoutHistoryPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getMyPayouts(user._id);
      setPayouts(data);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const filtered = filter === 'all' ? payouts : payouts.filter(p => p.triggerType === filter);
  const total = payouts.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="payouts-page">
      <div className="page-header">
        <h1>Payout History</h1>
        <p>A complete record of your automated parametric payouts.</p>
      </div>

      {/* Summary */}
      <div className="stats-grid">
        <div className="glass-card stat-card animate-fade-in delay-1">
          <div className="stat-icon-wrap emerald"><Wallet size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">Total Disbursed</span>
            <span className="stat-value">₹{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="glass-card stat-card animate-fade-in delay-2">
          <div className="stat-icon-wrap blue"><ArrowDownRight size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{payouts.length}</span>
          </div>
        </div>
        <div className="glass-card stat-card animate-fade-in delay-3">
          <div className="stat-icon-wrap amber"><Clock size={20} /></div>
          <div className="stat-body">
            <span className="stat-label">Average Payout</span>
            <span className="stat-value">₹{payouts.length ? Math.round(total / payouts.length) : 0}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="payout-controls animate-fade-in delay-3">
        <div className="filter-bar">
          <span className="filter-label"><Filter size={14} /> Filter:</span>
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Types</button>
          {Object.entries(TRIGGER_TYPES).map(([key, t]) => (
            <button key={key} className={`filter-chip ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payout Table */}
      <div className="glass-card table-container animate-fade-in delay-4">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Wallet size={32} /></div>
            <h3>No Payouts Yet</h3>
            <p>When verified disruptions occur in your active zone, automated payouts will appear here.</p>
          </div>
        ) : (
          <table className="payout-table">
            <thead>
              <tr>
                <th>Disruption Event</th>
                <th>Location Data</th>
                <th>Status</th>
                <th>Transaction Reference</th>
                <th className="amount-col">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const trigConf = TRIGGER_TYPES[p.triggerType] || {};
                const isProcessed = p.status === 'processed';
                return (
                  <tr key={p._id} className="table-row">
                    <td>
                      <div className="event-cell">
                        <span className="event-icon">{trigConf.icon || '⚡'}</span>
                        <div className="event-info">
                          <span className="event-name">{trigConf.label || p.triggerType}</span>
                          <span className="event-date">
                            {new Date(p.processedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="loc-cell">
                        <span className="loc-zone"><MapPin size={12} /> Zone {p.zone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${isProcessed ? 'success' : 'failed'}`}>
                        {isProcessed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span className="txn-ref">{p.upiTransactionId}</span>
                    </td>
                    <td className="amount-col">
                      <span className="amount-value text-green-600">₹{p.amount}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .payouts-page { max-width: 1100px; }

        .stat-card { padding: 24px; display: flex; align-items: flex-start; gap: 16px; }
        .stat-icon-wrap { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-icon-wrap.blue    { background: #DBEAFE; color: #2563EB; }
        .stat-icon-wrap.emerald { background: var(--accent-emerald-light); color: #059669; }
        .stat-icon-wrap.amber   { background: #FEF3C7; color: #D97706; }
        .stat-body { flex: 1; }
        .stat-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;}
        .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-top: 4px; display: block; }

        .payout-controls {
          margin-bottom: 24px;
        }
        .filter-bar {
          display: flex; align-items: center; gap: 10px;
          overflow-x: auto; flex-wrap: nowrap;
          padding-bottom: 8px; /* For scrollbar if needed */
        }
        .filter-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);
          margin-right: 8px;
        }
        .filter-chip {
          padding: 6px 16px; border-radius: 100px;
          background: #FFFFFF; border: 1px solid var(--border-light);
          color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
          cursor: pointer; white-space: nowrap;
          font-family: 'Inter', sans-serif;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        .filter-chip:hover {
          background: #F9FAFB;
        }
        .filter-chip.active {
          background: var(--text-primary);
          border-color: var(--text-primary);
          color: #FFFFFF;
        }

        .table-container {
          overflow: hidden; /* For border radius */
          overflow-x: auto; /* For small screens */
        }
        .payout-table {
          width: 100%; border-collapse: collapse; text-align: left;
        }
        .payout-table th {
          padding: 16px 24px;
          font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--text-muted); background: #F9FAFB;
          border-bottom: 1px solid var(--border-light);
        }
        .payout-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-light);
          color: var(--text-primary);
          vertical-align: middle;
        }
        .table-row:last-child td { border-bottom: none; }
        .table-row:nth-child(even) { background: #FAFAFA; }
        .table-row:hover { background: #F3F4F6; }

        .amount-col { text-align: right; }

        .event-cell { display: flex; align-items: center; gap: 14px; }
        .event-icon { 
          width: 36px; height: 36px; border-radius: 8px;
          background: var(--bg-primary); border: 1px solid var(--border-subtle);
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .event-info { display: flex; flex-direction: column; gap: 4px; }
        .event-name { font-weight: 600; font-size: 0.95rem; }
        .event-date { font-size: 0.75rem; color: var(--text-secondary); }

        .loc-cell { display: flex; flex-direction: column; gap: 4px; }
        .loc-zone { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 500; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 100px;
          font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
        }
        .status-badge.success { background: var(--accent-emerald-light); color: #059669; }
        .status-badge.failed { background: var(--accent-red-light); color: #DC2626; }

        .txn-ref { font-family: 'Inter', monospace; font-size: 0.85rem; color: var(--text-secondary); }

        .amount-value { font-weight: 700; font-size: 1.1rem; color: var(--text-primary); }
        .text-green-600 { color: #059669 !important; }

        .empty-state {
          text-align: center; padding: 64px 24px; color: var(--text-muted);
        }
        .empty-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: #F3F4F6; color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .empty-state h3 { margin-bottom: 8px; font-weight: 600; color: var(--text-primary); }
        .empty-state p { font-size: 0.95rem; max-width: 400px; margin: 0 auto; color: var(--text-secondary); }

      `}</style>
    </div>
  );
}
