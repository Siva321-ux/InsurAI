import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <div className="logo">
          <div className="logo-icon-wrap">
            <Zap size={28} />
          </div>
          <h1>GigShield</h1>
          <p>AI-Powered Income Protection</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" strokeWidth={1.5} />
              <input
                id="login-phone"
                type="tel"
                className="input-field"
                placeholder="Enter your phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" strokeWidth={1.5} />
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <Loader2 size={18} className="spinning" /> : <><span>Sign In</span><ArrowRight size={18} strokeWidth={1.5} /></>}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>

        <div className="demo-hint">
          <span>Demo: 9876543210 / password123</span>
        </div>
      </div>

      <style>{`
        .logo-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--accent-orange-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-orange);
          margin: 0 auto 16px;
        }
        .auth-error {
          background: var(--accent-red-light);
          color: var(--accent-red);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon .input-field {
          padding-left: 42px;
        }
        .spinning {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .demo-hint {
          text-align: center;
          margin-top: 24px;
          padding: 12px;
          background: #F3F4F6;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
