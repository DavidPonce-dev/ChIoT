import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Device } from '../models/Device';

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'add_device_type_index',
    up: async () => {
      await Device.collection.createIndex({ type: 1 });
      console.log('Migration 1: Created index on device.type');
    },
  },
  {
    version: 2,
    name: 'add_owner_type_index',
    up: async () => {
      await Device.collection.createIndex({ owner: 1, type: 1 });
      console.log('Migration 2: Created compound index on device.owner + type');
    },
  },
  {
    version: 3,
    name: 'add_default_states',
    up: async () => {
      await Device.updateMany(
        { type: 'LED_STRIP', 'state.mode': { $exists: false } },
        { $set: { 'state.mode': 'static', 'state.brightness': 100, 'state.color': '#FFFFFF' } }
      );
      await Device.updateMany(
        { type: 'smart_lock', 'state.locked': { $exists: false } },
        { $set: { 'state.locked': true } }
      );
      console.log('Migration 3: Added default states to existing devices');
    },
  },
];

const migrationCollection = 'migrations';

const getMigrationsCollection = () => {
  return mongoose.connection.collection(migrationCollection);
};

const getCurrentVersion = async (): Promise<number> => {
  const collection = getMigrationsCollection();
  const record = await collection.findOne({ _id: 'current_version' } as Record<string, string>);
  return (record as { version?: number })?.version || 0;
};

const setVersion = async (version: number) => {
  const collection = getMigrationsCollection();
  await collection.updateOne(
    { _id: 'current_version' } as Record<string, string>,
    { $set: { version, updatedAt: new Date() } },
    { upsert: true }
  );
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    const currentVersion = await getCurrentVersion();
    console.log(`Current migration version: ${currentVersion}`);

    const pendingMigrations = migrations.filter((m) => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      process.exit(0);
    }

    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      await migration.up();
      await setVersion(migration.version);
      console.log(`Migration ${migration.version} completed`);
    }

    console.log('All migrations completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

const rollback = async (targetVersion: number) => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    const completedMigrations = migrations
      .filter((m) => m.version > targetVersion && m.down)
      .sort((a, b) => b.version - a.version);

    for (const migration of completedMigrations) {
      console.log(`Rolling back migration ${migration.version}: ${migration.name}`);
      await migration.down!();
      await setVersion(migration.version - 1);
      console.log(`Rollback ${migration.version} completed`);
    }

    console.log('Rollback completed!');
    process.exit(0);
  } catch (err) {
    console.error('Rollback failed:', err);
    process.exit(1);
  }
};

const command = process.argv[2];
if (command === 'rollback' && process.argv[3]) {
  rollback(parseInt(process.argv[3], 10));
} else {
  migrate();
}
