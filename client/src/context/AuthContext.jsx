import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock workers database
const MOCK_WORKERS = [
  {
    _id: 'w1',
    name: 'Ravi Kumar',
    phone: '9876543210',
    email: 'ravi@example.com',
    password: 'password123',
    upiId: 'ravi@upi',
    platform: 'zomato',
    activeZone: '400053',
    city: 'Mumbai',
    avgDailyHours: 10,
    weeklyEarnings: 5200,
    fraudFlags: 0,
    status: 'active',
    gpsHistory: [
      { lat: 19.0760, lng: 72.8777, timestamp: new Date() }
    ]
  },
  {
    _id: 'w2',
    name: 'Priya Sharma',
    phone: '9876543211',
    email: 'priya@example.com',
    password: 'password123',
    upiId: 'priya@upi',
    platform: 'swiggy',
    activeZone: '560001',
    city: 'Bengaluru',
    avgDailyHours: 8,
    weeklyEarnings: 4800,
    fraudFlags: 0,
    status: 'active',
    gpsHistory: [
      { lat: 12.9716, lng: 77.5946, timestamp: new Date() }
    ]
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gigshield_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800));
    
    const worker = MOCK_WORKERS.find(w => w.phone === phone && w.password === password);
    if (!worker) {
      throw new Error('Invalid phone number or password');
    }
    
    const userData = { ...worker, token: 'mock-jwt-token-' + worker._id };
    setUser(userData);
    localStorage.setItem('gigshield_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    await new Promise(r => setTimeout(r, 1000));
    
    const newWorker = {
      _id: 'w' + Date.now(),
      ...data,
      fraudFlags: 0,
      status: 'active',
      weeklyEarnings: 4500,
      gpsHistory: [{ lat: 19.0760, lng: 72.8777, timestamp: new Date() }],
      token: 'mock-jwt-token-' + Date.now()
    };
    
    MOCK_WORKERS.push(newWorker);
    setUser(newWorker);
    localStorage.setItem('gigshield_user', JSON.stringify(newWorker));
    return newWorker;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gigshield_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
