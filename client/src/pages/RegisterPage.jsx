import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, User, Phone, Lock, MapPin, CreditCard, Bike, ArrowRight, Loader2 } from 'lucide-react';
import { CITIES_ZONES } from '../services/api.js';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    upiId: '', platform: 'zomato',
    city: 'Mumbai', activeZone: '400053',
    avgDailyHours: 8,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (field === 'city') {
      const zones = CITIES_ZONES[e.target.value] || [];
      setForm(f => ({ ...f, city: e.target.value, activeZone: zones[0] || '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const zones = CITIES_ZONES[form.city] || [];

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in" style={{ maxWidth: 540 }}>
        <div className="logo">
          <div className="logo-icon-wrap">
            <Zap size={28} />
          </div>
          <h1>Join GigShield</h1>
          <p>Get protected in under 2 minutes</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label><User size={14} /> Full Name</label>
              <input id="reg-name" className="input-field" placeholder="Ravi Kumar" value={form.name} onChange={update('name')} required />
            </div>
            <div className="input-group">
              <label><Phone size={14} /> Phone</label>
              <input id="reg-phone" className="input-field" type="tel" placeholder="9876543210" value={form.phone} onChange={update('phone')} required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Lock size={14} /> Password</label>
              <input id="reg-password" className="input-field" type="password" placeholder="Create password" value={form.password} onChange={update('password')} required />
            </div>
            <div className="input-group">
              <label><CreditCard size={14} /> UPI ID</label>
              <input id="reg-upi" className="input-field" placeholder="name@upi" value={form.upiId} onChange={update('upiId')} required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><Bike size={14} /> Platform</label>
              <select id="reg-platform" className="input-field" value={form.platform} onChange={update('platform')}>
                <option value="zomato">Zomato</option>
                <option value="swiggy">Swiggy</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="input-group">
              <label><MapPin size={14} /> City</label>
              <select id="reg-city" className="input-field" value={form.city} onChange={update('city')}>
                {Object.keys(CITIES_ZONES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label><MapPin size={14} /> Active Zone (PIN)</label>
              <select id="reg-zone" className="input-field" value={form.activeZone} onChange={update('activeZone')}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Avg Daily Hours</label>
              <input id="reg-hours" className="input-field" type="number" min="1" max="16" value={form.avgDailyHours} onChange={update('avgDailyHours')} />
            </div>
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '12px' }}>
            {loading ? <Loader2 size={18} className="spinning" /> : <><span>Create Account</span><ArrowRight size={18} strokeWidth={1.5} /></>}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </div>

      <style>{`
        .logo-icon-wrap {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: var(--accent-orange-light);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent-orange); margin: 0 auto 16px;
        }
        .auth-error {
          background: var(--accent-red-light);
          color: var(--accent-red);
          padding: 12px 16px; border-radius: var(--radius-md);
          font-size: 0.9rem; margin-bottom: 16px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 480px) {
          .form-row { grid-template-columns: 1fr; }
        }
        .spinning { animation: spin 0.8s linear infinite; }
        .input-group label {
          display: flex; align-items: center; gap: 6px;
        }
      `}</style>
    </div>
  );
}
