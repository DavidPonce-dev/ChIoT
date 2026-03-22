import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import { Device } from '../models/Device';

const seedUsers = async () => {
  const testPassword = await bcrypt.hash('test1234', 10);

  const users = [
    { email: 'admin@test.com', password: testPassword },
    { email: 'user@test.com', password: testPassword },
  ];

  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      await User.create(userData);
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User exists: ${userData.email}`);
    }
  }

  return users;
};

const seedDevices = async (users: { email: string }[]) => {
  const user = await User.findOne({ email: users[0].email });
  if (!user) return;

  const devices = [
    {
      name: 'Living Room LED',
      type: 'LED_STRIP',
      state: { brightness: 80, color: '#FF5500', mode: 'static' },
    },
    {
      name: 'Bedroom LED',
      type: 'LED_STRIP',
      state: { brightness: 50, color: '#00FF00', mode: 'rainbow' },
    },
    {
      name: 'Living Room Thermostat',
      type: 'thermostat',
      state: { temperature: 22, mode: 'cool' },
    },
    { name: 'Kitchen Sensor', type: 'sensor', state: { temperature: 21, humidity: 45 } },
    { name: 'Front Door Lock', type: 'smart_lock', state: { locked: true } },
  ];

  for (const deviceData of devices) {
    const existing = await Device.findOne({ name: deviceData.name, owner: user._id });
    if (!existing) {
      const uuid = uuidv4();
      await Device.create({
        uuid,
        name: deviceData.name,
        type: deviceData.type,
        mqttUser: `dev_${uuid.slice(0, 6)}`,
        mqttPass: Math.random().toString(36).slice(-10),
        owner: user._id,
        state: deviceData.state,
      });
      console.log(`Created device: ${deviceData.name}`);
    } else {
      console.log(`Device exists: ${deviceData.name}`);
    }
  }
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Device.deleteMany({});
    console.log('Cleared existing data');

    const users = await seedUsers();
    await seedDevices(users);

    console.log('Seed completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
