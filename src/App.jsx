import { useMemo, useState } from 'react';

const zones = [
  'Rampur Village',
  'North Field',
  'South Plot',
  'East Boundary',
  'West Junction',
];

const cropPresets = [
  { name: 'Paddy (Rice)', minutes: 90 },
  { name: 'Wheat', minutes: 45 },
  { name: 'Sugarcane', minutes: 75 },
  { name: 'Cotton', minutes: 60 },
];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedZone, setSelectedZone] = useState(zones[0]);
  const [powerOn, setPowerOn] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date(Date.now() - 10 * 60000));
  const [cropType, setCropType] = useState(cropPresets[0].name);
  const [customMinutes, setCustomMinutes] = useState('90');

  const freshness = useMemo(() => {
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (diff === 0) return 'Just now';
    if (diff === 1) return '1 minute ago';
    return `${diff} minutes ago`;
  }, [lastUpdated]);

  const preset = cropPresets.find((item) => item.name === cropType)?.minutes || 30;
  const timerMinutes = customMinutes || preset;

  const handleLogin = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError('Enter a valid email and password.');
      return;
    }
    if (!email.includes('@')) {
      setLoginError('Enter a valid email address.');
      return;
    }
    setLoginError('');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setEmail('');
    setPassword('');
    setLoginError('');
  };

  const handleToggle = (value) => {
    setPowerOn(value);
    setLastUpdated(new Date());
  };

  if (!loggedIn) {
    return (
      <div className="app-shell">
        <section className="login-card">
          <div className="login-header">
            <div className="brand-icon">⚡</div>
            <div>
              <p className="eyebrow">Grama-Urja</p>
              <h1>Welcome back</h1>
              <p className="login-copy">Sign in to manage your village power and irrigation updates.</p>
            </div>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {loginError && <div className="login-error">{loginError}</div>}

            <button type="submit" className="btn login-button">
              Sign In
            </button>
            <p className="login-help">Demo login: any valid email and password will work.</p>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell mobile-layout">
      <header className="topbar">
        <button className="icon-btn">☰</button>
        <div className="brand-row">
          <div className="brand-icon-circle">⚡</div>
          <div>
            <p className="brand-title">Grama-Urja</p>
            <p className="brand-subtitle">Community Power. Better Farming.</p>
          </div>
        </div>
        <button className="icon-btn notification-btn">
          🔔
          <span className="badge">3</span>
        </button>
      </header>

      <section className="zone-card">
        <div>
          <div className="zone-label">Your Zone</div>
          <div className="zone-title">{selectedZone}</div>
          <div className="zone-subtitle">Transformer: TR-05</div>
        </div>
        <button className="select-zone">▾</button>
      </section>

      <section className="power-card">
        <div className="power-card-row">
          <div>
            <div className="power-card-label">CURRENT POWER STATUS</div>
            <div className="power-card-status">POWER IS</div>
            <div className="power-card-value">{powerOn ? 'ON' : 'OFF'}</div>
          </div>
          <div className="power-icon-circle">⚡</div>
        </div>

        <div className="status-footer">
          <div>Confirmed by 23 users in your zone</div>
          <div className="thank-you">Thank you! 💛</div>
        </div>
      </section>

      <section className="live-row">
        <div className="live-info">
          <span className="live-dot">⏱️</span>
          <div>
            <div className="live-label">Last seen: {freshness}</div>
            <div className="live-time">Today, 9:31 AM</div>
          </div>
        </div>
        <div className="live-chip">• LIVE</div>
      </section>

      <section className="action-panel">
        <div className="section-heading">UPDATE POWER STATUS</div>
        <div className="status-options">
          <button
            type="button"
            className={`status-option ${!powerOn ? 'status-off-card' : ''}`}
            onClick={() => handleToggle(false)}
          >
            <span className="status-icon">⏻</span>
            <span className="status-small">POWER IS</span>
            <strong>OFF</strong>
          </button>
          <button
            type="button"
            className={`status-option ${powerOn ? 'status-on-card' : ''}`}
            onClick={() => handleToggle(true)}
          >
            <span className="status-icon">⏻</span>
            <span className="status-small">POWER IS</span>
            <strong>ON</strong>
          </button>
        </div>
        <div className="status-note">Your update helps the whole community!</div>
      </section>

      <section className="timer-card">
        <div className="timer-top">
          <div className="timer-icon">🚜</div>
          <div>
            <div className="timer-title">PUMP TIMER</div>
            <div className="timer-select-label">Select Crop</div>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
            >
              {cropPresets.map((crop) => (
                <option key={crop.name} value={crop.name}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="timer-summary">
          <div>
            <div className="timer-summary-label">Recommended Duration</div>
            <div className="timer-summary-value">{preset} mins</div>
          </div>
          <button className="btn start-timer">START TIMER</button>
        </div>

        <div className="timer-help">For optimal irrigation</div>
      </section>

      <section className="quick-actions">
        <button className="action-card-small">
          <div className="action-icon blue">👥</div>
          <div>My Community</div>
        </button>
        <button className="action-card-small">
          <div className="action-icon orange">📊</div>
          <div>Power History</div>
        </button>
        <button className="action-card-small">
          <div className="action-icon purple">💧</div>
          <div>Irrigation Tips</div>
        </button>
        <button className="action-card-small">
          <div className="action-icon teal">🎧</div>
          <div>Help & Support</div>
        </button>
      </section>

      <nav className="bottom-nav">
        <button className="nav-item active">
          <span>🏠</span>
          <div>Home</div>
        </button>
        <button className="nav-item">
          <span>📍</span>
          <div>Map</div>
        </button>
        <button className="nav-item">
          <span>🔔</span>
          <div>Alerts</div>
        </button>
        <button className="nav-item">
          <span>👤</span>
          <div>Profile</div>
        </button>
      </nav>
    </div>
  );
}

export default App;
