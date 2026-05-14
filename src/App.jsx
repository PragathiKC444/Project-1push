import { useMemo, useState } from 'react';

const zones = [
  'Village Main',
  'North Field',
  'South Plot',
  'East Boundary',
  'West Junction',
  'Market Area',
];

const cropPresets = [
  { name: 'Rice', minutes: 90 },
  { name: 'Wheat', minutes: 45 },
  { name: 'Sugarcane', minutes: 75 },
  { name: 'Cotton', minutes: 60 },
];

function App() {
  const [selectedZone, setSelectedZone] = useState(zones[0]);
  const [powerOn, setPowerOn] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [cropType, setCropType] = useState(cropPresets[0].name);
  const [customMinutes, setCustomMinutes] = useState('30');

  const freshness = useMemo(() => {
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (diff === 0) return 'Just now';
    if (diff === 1) return '1 minute ago';
    return `${diff} minutes ago`;
  }, [lastUpdated]);

  const preset = cropPresets.find((item) => item.name === cropType)?.minutes || 30;
  const timerMinutes = customMinutes || preset;

  const handleToggle = (value) => {
    setPowerOn(value);
    setLastUpdated(new Date());
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Grama-Urja</p>
          <h1>Smart village power alerts</h1>
          <p className="tagline">Know when your pump can run using community-powered updates.</p>
        </div>
        <div className="hero-pulse">{selectedZone}</div>
      </header>

      <section className="status-panel">
        <div className={`status-card ${powerOn ? 'status-on' : 'status-off'}`}>
          <div className="status-label">Current status</div>
          <div className="status-value">{powerOn ? 'ON' : 'OFF'}</div>
          <div className="status-freshness">{freshness}</div>
        </div>

        <div className="action-card">
          <div className="action-title">Broadcast your update</div>
          <div className="action-text">Tap a status button to notify your zone. Power changes are visible immediately to your community.</div>
          <div className="button-row">
            <button className="btn btn-on" onClick={() => handleToggle(true)}>
              Power is ON
            </button>
            <button className="btn btn-off" onClick={() => handleToggle(false)}>
              Power is OFF
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">Pump Timer</div>
        <div className="field-row">
          <label htmlFor="crop-select">Crop type</label>
          <select
            id="crop-select"
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

        <div className="field-row">
          <label htmlFor="duration-input">Run duration</label>
          <input
            id="duration-input"
            type="number"
            min="1"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
          />
        </div>

        <div className="timer-summary-grid">
          <div className="timer-summary-card">
            <span>Recommended</span>
            <strong>{preset} mins</strong>
          </div>
          <div className="timer-summary-card">
            <span>Selected</span>
            <strong>{timerMinutes} mins</strong>
          </div>
        </div>
      </section>

      <footer className="footer-note">
        Built for bright fields, fast decisions, and easy community alerts.
      </footer>
    </div>
  );
}

export default App;
