import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const profile = {
  id: 'u123',
  name: 'Ramu Patel',
  email: 'ramu@gramaurja.com',
  phone: '+91 98765 43210',
  role: 'Field Coordinator',
  community: 'Rampur Village',
  zonesManaged: ['Rampur Village', 'East Boundary'],
  membersConfirmed: 23,
  notifications: 3,
};

const notifications = [
  {
    id: 'n1',
    title: 'Power return confirmed',
    message: 'Power is back in Rampur Village after the scheduled outage.',
    time: '2 minutes ago',
    type: 'status',
  },
  {
    id: 'n2',
    title: 'Pump timer scheduled',
    message: 'Your irrigation timer is set for 90 minutes on Paddy.',
    time: '15 minutes ago',
    type: 'timer',
  },
  {
    id: 'n3',
    title: 'Transformer check reminder',
    message: 'Please inspect transformer TR-05 before the next power cycle.',
    time: '1 hour ago',
    type: 'alert',
  },
];

const mapZones = [
  {
    id: 'z1',
    name: 'Rampur Village',
    transformer: 'TR-05',
    status: 'ON',
    lastSeen: '10 mins ago',
    coordinates: '26.9124° N, 75.7873° E',
  },
  {
    id: 'z2',
    name: 'North Field',
    transformer: 'TR-11',
    status: 'OFF',
    lastSeen: '22 mins ago',
    coordinates: '26.9150° N, 75.7900° E',
  },
  {
    id: 'z3',
    name: 'East Boundary',
    transformer: 'TR-08',
    status: 'ON',
    lastSeen: '5 mins ago',
    coordinates: '26.9105° N, 75.7950° E',
  },
];

const powerStatus = {
  powerOn: true,
  lastUpdated: new Date(Date.now() - 10 * 60000).toISOString(),
  confirmedBy: 23,
  live: true,
};

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  return res.json({ token: 'demo-token', profile });
});

app.get('/api/profile', (_req, res) => {
  res.json(profile);
});

app.get('/api/notifications', (_req, res) => {
  res.json(notifications);
});

app.get('/api/map', (_req, res) => {
  res.json(mapZones);
});

app.get('/api/status', (_req, res) => {
  res.json(powerStatus);
});

app.post('/api/status', (req, res) => {
  const { powerOn } = req.body;
  powerStatus.powerOn = Boolean(powerOn);
  powerStatus.lastUpdated = new Date().toISOString();
  if (powerOn) {
    notifications.unshift({
      id: `n${Date.now()}`,
      title: 'Power status updated',
      message: 'You marked your zone as ON and shared the update with the community.',
      time: 'Just now',
      type: 'status',
    });
  }
  res.json(powerStatus);
});

app.post('/api/timer', (req, res) => {
  const { zone, crop, minutes } = req.body;
  const duration = Number(minutes) || 30;
  notifications.unshift({
    id: `n${Date.now()}`,
    title: 'Pump timer started',
    message: `Timer started for ${duration} minutes in ${zone} (${crop}).`, 
    time: 'Just now',
    type: 'timer',
  });
  res.json({ zone, crop, minutes: duration, startedAt: new Date().toISOString() });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend API running at http://localhost:${port}`);
});
