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
      <header>
        <h1>Grama-Urja</h1>
        <p className="tagline">Crowdsourced rural power alerts</p>
      </header>

      <section className="card">
        <label htmlFor="zone-select">Transformer Zone</label>
        <select
          id="zone-select"
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
        >
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </section>

      <section className={`status-card ${powerOn ? 'status-on' : 'status-off'}`}>
        <div className="status-label">Power Status</div>
        <div className="status-value">{powerOn ? 'ON' : 'OFF'}</div>
        <div className="freshness">Updated: {freshness}</div>
      </section>

      <section className="button-row">
        <button className="btn btn-on" onClick={() => handleToggle(true)}>
          Power is ON
        </button>
        <button className="btn btn-off" onClick={() => handleToggle(false)}>
          Power is OFF
        </button>
      </section>

      <section className="card">
        <h2>Pump Timer</h2>
        <div className="field-row">
          <label htmlFor="crop-select">Crop Type</label>
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
          <label htmlFor="duration-input">Duration (minutes)</label>
          <input
            id="duration-input"
            type="number"
            min="1"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
          />
        </div>

        <div className="timer-summary">
          Recommended run time for {cropType}: {preset} minutes
        </div>
        <div className="timer-summary">Selected run time: {timerMinutes} minutes</div>
      </section>

      <footer>
        <p>High-contrast interface for outdoor visibility.</p>
      </footer>
    </div>
  );
}

export default App;
