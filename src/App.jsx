import { useEffect, useMemo, useState } from 'react';

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

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [mapZones, setMapZones] = useState([]);
  const [status, setStatus] = useState(null);
  const [cropType, setCropType] = useState(cropPresets[0].name);
  const [customMinutes, setCustomMinutes] = useState('90');
  const [selectedZone, setSelectedZone] = useState(zones[0]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerDuration, setTimerDuration] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const timerPercent = timerActive && timerDuration > 0
    ? Math.round((1 - timeRemaining / timerDuration) * 100)
    : 0;

  const freshness = useMemo(() => {
    if (!status) return 'Loading...';
    const diff = Math.floor((Date.now() - new Date(status.lastUpdated).getTime()) / 60000);
    if (diff === 0) return 'Just now';
    if (diff === 1) return '1 minute ago';
    return `${diff} minutes ago`;
  }, [status]);

  const preset = cropPresets.find((item) => item.name === cropType)?.minutes || 30;
  const timerMinutes = Number(customMinutes || preset);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    Promise.all([
      fetch(`${apiBase}/api/profile`).then((res) => res.json()),
      fetch(`${apiBase}/api/notifications`).then((res) => res.json()),
      fetch(`${apiBase}/api/map`).then((res) => res.json()),
      fetch(`${apiBase}/api/status`).then((res) => res.json()),
    ])
      .then(([profileData, notificationsData, mapData, statusData]) => {
        setProfile(profileData);
        setNotifications(notificationsData);
        setMapZones(mapData);
        setStatus(statusData);
        if (mapData.length) {
          setCropType(cropPresets[0].name);
        }
      })
      .catch(() => {
        setLoginError('Unable to load backend data.');
      })
      .finally(() => setLoading(false));
  }, [loggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError('Enter a valid email and password.');
      return;
    }
    if (!email.includes('@')) {
      setLoginError('Enter a valid email address.');
      return;
    }

    try {
      setLoginError('');
      const response = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setLoginError(error.message || 'Login failed.');
        return;
      }

      const data = await response.json();
      setProfile(data.profile);
      setLoggedIn(true);
      setView('home');
    } catch (error) {
      setLoginError('Backend is not available. Start the server with npm run backend.');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setEmail('');
    setPassword('');
    setLoginError('');
    setProfile(null);
    setNotifications([]);
    setMapZones([]);
    setStatus(null);
    setTimerActive(false);
    setTimeRemaining(0);
    setMessage('Logged out successfully.');
  };

  const handleToggle = async (value) => {
    if (!status) return;
    try {
      const response = await fetch(`${apiBase}/api/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ powerOn: value }),
      });
      const updated = await response.json();
      setStatus(updated);
      setMessage(`Power turned ${value ? 'ON' : 'OFF'} successfully.`);
    } catch (error) {
      console.error(error);
      setMessage('Unable to update status. Try again later.');
    }
  };

  const handleNotificationClick = (note) => {
    setView('alerts');
    setMessage(note.message);
  };

  const handleSelectZone = () => {
    setView('map');
    setMessage('Select a zone from the map overview.');
  };

  const handleStartTimer = async () => {
    const minutes = Number(timerMinutes);
    if (minutes <= 0) {
      setMessage('Enter a timer duration greater than zero.');
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: selectedZone, crop: cropType, minutes }),
      });
      const timerData = await response.json();
      setTimerActive(true);
      setTimerDuration(timerData.minutes * 60);
      setTimeRemaining(timerData.minutes * 60);
      setMessage(`Pump timer started for ${timerData.minutes} minutes in ${selectedZone}.`);
      setStatus((current) => ({
        ...current,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error(error);
      setMessage('Unable to start timer. Try again later.');
    }
  };

  const handleQuickAction = (action) => {
    setMessage(`Opening ${action.replace('-', ' ')}.`);
    setView(action);
  };

  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          setMessage(`Pump timer finished for ${selectedZone}.`);
          setNotifications((current) => [
            {
              id: `n${Date.now()}`,
              title: 'Irrigation complete',
              message: `Your ${selectedZone} pump timer has completed successfully.`,
              time: 'Just now',
              type: 'timer',
            },
            ...current,
          ]);

          fetch(`${apiBase}/api/status`)
            .then((res) => res.json())
            .then((updatedStatus) => setStatus(updatedStatus))
            .catch((error) => {
              console.error('Failed to refresh status after timer finished', error);
            });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, selectedZone]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  const renderHome = () => (
    <>
      <section className="zone-card">
        <div>
          <div className="zone-label">Your Zone</div>
          <div className="zone-title">{selectedZone || profile?.community || 'Rampur Village'}</div>
          <div className="zone-subtitle">Transformer: TR-05</div>
        </div>
        <button className="select-zone" type="button" onClick={handleSelectZone}>▾</button>
      </section>

      <section className="power-card">
        <div className="power-card-row">
          <div>
            <div className="power-card-label">CURRENT POWER STATUS</div>
            <div className="power-card-status">POWER IS</div>
            <div className="power-card-value">{status?.powerOn ? 'ON' : 'OFF'}</div>
          </div>
          <div className="power-icon-circle">⚡</div>
        </div>

        <div className="status-footer">
          <div>Confirmed by {status?.confirmedBy || 0} users in your zone</div>
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
            className={`status-option ${status?.powerOn ? '' : 'status-off-card'}`}
            onClick={() => handleToggle(false)}
          >
            <span className="status-icon">⏻</span>
            <span className="status-small">POWER IS</span>
            <strong>OFF</strong>
          </button>
          <button
            type="button"
            className={`status-option ${status?.powerOn ? 'status-on-card' : ''}`}
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

        <div className="timer-input-row">
          <label>
            Duration (mins)
            <input
              type="number"
              min="5"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
            />
          </label>
        </div>

        <div className="timer-summary">
          <div>
            <div className="timer-summary-label">Planned duration</div>
            <div className="timer-summary-value">{timerMinutes} mins</div>
          </div>
          <button className="btn start-timer" type="button" onClick={handleStartTimer}>
            {timerActive ? 'RESTART TIMER' : 'START TIMER'}
          </button>
        </div>

        {timerActive && (
          <div className="timer-progress-row">
            <div className="timer-progress-bar">
              <div className="timer-progress-fill" style={{ width: `${timerPercent}%` }} />
            </div>
            <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} remaining</span>
          </div>
        )}

        <div className="timer-help">For optimal irrigation</div>
      </section>

      {message && <div className="toast-message">{message}</div>}

      <section className="quick-actions">
        <button className="action-card-small" type="button" onClick={() => handleQuickAction('community')}>
          <div className="action-icon blue">👥</div>
          <div>My Community</div>
        </button>
        <button className="action-card-small" type="button" onClick={() => handleQuickAction('history')}>
          <div className="action-icon orange">📊</div>
          <div>Power History</div>
        </button>
        <button className="action-card-small" type="button" onClick={() => handleQuickAction('tips')}>
          <div className="action-icon purple">💧</div>
          <div>Irrigation Tips</div>
        </button>
        <button className="action-card-small" type="button" onClick={() => handleQuickAction('support')}>
          <div className="action-icon teal">🎧</div>
          <div>Help & Support</div>
        </button>
      </section>
    </>
  );

  const renderMap = () => (
    <section className="map-view">
      <div className="section-heading">Zone map overview</div>
      <div className="map-summary">Selected zone: {selectedZone}</div>
      <div className="info-card map-info-card">
        <div>Tap any zone to make it the active irrigation area.</div>
        <div>Current pump timer: {timerActive ? `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, '0')} remaining` : 'Not active'}</div>
      </div>
      <div className="map-grid">
        {mapZones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            className={`map-card ${selectedZone === zone.name ? 'map-card-selected' : ''}`}
            onClick={() => {
              setSelectedZone(zone.name);
              setMessage(`Selected ${zone.name}.`);
            }}
          >
            <div className="map-card-heading">{zone.name}</div>
            <div className="map-chip">{zone.status}</div>
            <div className="map-item">Transformer: {zone.transformer}</div>
            <div className="map-item">Last seen: {zone.lastSeen}</div>
            <div className="map-coordinates">{zone.coordinates}</div>
          </button>
        ))}
      </div>
    </section>
  );

  const renderActionPage = (title, description) => (
    <section className="info-view">
      <div className="section-heading">{title}</div>
      <div className="info-card">
        <p>{description}</p>
        <div className="info-footer">Tap the bottom navigation or Home to return.</div>
      </div>
    </section>
  );

  const renderAlerts = () => (
    <section className="alerts-view">
      <div className="section-heading">Notifications</div>
      {notifications.map((note) => (
        <button
          key={note.id}
          type="button"
          className="notification-card"
          onClick={() => handleNotificationClick(note)}
        >
          <div className="notification-title">{note.title}</div>
          <div className="notification-time">{note.time}</div>
          <p className="notification-message">{note.message}</p>
        </button>
      ))}
    </section>
  );

  const renderProfile = () => (
    <section className="profile-view">
      <div className="section-heading">My Profile</div>
      <div className="profile-card">
        <div className="profile-avatar">{profile?.name?.charAt(0)}</div>
        <div>
          <div className="profile-name">{profile?.name}</div>
          <div className="profile-role">{profile?.role}</div>
        </div>
      </div>
      <div className="profile-details">
        <div className="profile-detail-row">
          <span>Email</span>
          <strong>{profile?.email}</strong>
        </div>
        <div className="profile-detail-row">
          <span>Phone</span>
          <strong>{profile?.phone}</strong>
        </div>
        <div className="profile-detail-row">
          <span>Community</span>
          <strong>{profile?.community}</strong>
        </div>
        <div className="profile-detail-row">
          <span>Zones managed</span>
          <strong>{profile?.zonesManaged?.join(', ')}</strong>
        </div>
      </div>
      <button className="btn logout-button" onClick={handleLogout}>
        Log out
      </button>
    </section>
  );

  return (
    <div className="app-shell mobile-layout">
      <header className="topbar">
        <button className="icon-btn" type="button" onClick={() => setView('home')}>
          ☰
        </button>
        <div className="brand-row">
          <div className="brand-icon-circle">⚡</div>
          <div>
            <p className="brand-title">Grama-Urja</p>
            <p className="brand-subtitle">Community Power. Better Farming.</p>
          </div>
        </div>
        <button className="icon-btn notification-btn" type="button" onClick={() => setView('alerts')}>
          🔔
          <span className="badge">{notifications.length}</span>
        </button>
      </header>

      {loading ? (
        <div className="loading-state">Loading content...</div>
      ) : (
        <div>
          {view === 'home' && renderHome()}
          {view === 'map' && renderMap()}
          {view === 'alerts' && renderAlerts()}
          {view === 'profile' && renderProfile()}
          {view === 'community' && renderActionPage('My Community', 'Manage local power sharing, farmer groups, and field support schedules here.')}
          {view === 'history' && renderActionPage('Power History', 'View the latest status changes, outage reports, and usage trends in your area.')}
          {view === 'tips' && renderActionPage('Irrigation Tips', 'Get crop-specific irrigation guidance, water-saving pointers, and best practices for your zone.')}
          {view === 'support' && renderActionPage('Help & Support', 'Contact local support, log a request, or get quick answers to your field questions.')}
        </div>
      )}

      <nav className="bottom-nav">
        <button className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
          <span>🏠</span>
          <div>Home</div>
        </button>
        <button className={`nav-item ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
          <span>📍</span>
          <div>Map</div>
        </button>
        <button className={`nav-item ${view === 'alerts' ? 'active' : ''}`} onClick={() => setView('alerts')}>
          <span>🔔</span>
          <div>Alerts</div>
        </button>
        <button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>
          <span>👤</span>
          <div>Profile</div>
        </button>
      </nav>
    </div>
  );
}

export default App;
