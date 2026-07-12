const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8')
);

const { provinces, districts, stations, vehicles, pings } = seedData;

function findById(items, id) {
  return items.find((item) => item.id === Number(id));
}

function toProvince(item) {
  return {
    province_id: item.id,
    name: item.name,
  };
}

function toDistrict(item) {
  return {
    district_id: item.id,
    name: item.name,
    province_id: item.province_id,
  };
}

function toStation(item) {
  return {
    station_id: item.id,
    name: item.name,
    district_id: item.district_id,
  };
}

function toVehicle(item) {
  return {
    vehicle_id: item.id,
    reg_number: item.register_number,
    device_id: item.device_id,
    station_id: item.station_id,
  };
}

function toPing(item) {
  return {
    ping_id: item.id,
    vehicle_id: item.vehicle_id,
    timestamp: item.timestamp,
    lat: item.latitude,
    lng: item.longitude,
    speed: item.speed ?? 0,
  };
}

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/provinces', (req, res) => {
  res.json(provinces.map(toProvince));
});

app.get('/provinces/:provinceId', (req, res) => {
  const province = findById(provinces, req.params.provinceId);
  if (!province) {
    return res.status(404).json({ error: 'Province not found' });
  }
  res.json(toProvince(province));
});

app.get('/districts', (req, res) => {
  res.json(districts.map(toDistrict));
});

app.get('/districts/:districtId', (req, res) => {
  const district = findById(districts, req.params.districtId);
  if (!district) {
    return res.status(404).json({ error: 'District not found' });
  }
  res.json(toDistrict(district));
});

app.get('/stations', (req, res) => {
  res.json(stations.map(toStation));
});

app.get('/stations/:stationId', (req, res) => {
  const station = findById(stations, req.params.stationId);
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  res.json(toStation(station));
});

app.get('/vehicles', (req, res) => {
  res.json(vehicles.map(toVehicle));
});

app.get('/vehicles/:vehicleId', (req, res) => {
  const vehicle = findById(vehicles, req.params.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const vehiclePings = pings
    .filter((ping) => ping.vehicle_id === Number(req.params.vehicleId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const lastPing = vehiclePings.length > 0 ? toPing(vehiclePings[0]) : null;

  res.json({
    ...toVehicle(vehicle),
    last_ping: lastPing,
  });
});

app.get('/vehicles/:vehicleId/pings', (req, res) => {
  const vehicle = findById(vehicles, req.params.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const vehiclePings = pings
    .filter((ping) => ping.vehicle_id === Number(req.params.vehicleId))
    .map(toPing);
  res.json(vehiclePings);
});

app.get('/vehicles/:vehicleId/last-position', (req, res) => {
  const vehicle = findById(vehicles, req.params.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  const vehiclePings = pings
    .filter((ping) => ping.vehicle_id === Number(req.params.vehicleId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (vehiclePings.length === 0) {
    return res.status(404).json({ error: 'No pings found for this vehicle' });
  }

  const lastPing = vehiclePings[0];
  res.json({
    vehicle_id: Number(req.params.vehicleId),
    timestamp: lastPing.timestamp,
    lat: lastPing.latitude,
    lng: lastPing.longitude,
    speed: lastPing.speed ?? 0,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
