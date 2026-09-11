import mongoose from 'mongoose';
import connectToDatabase from '../server/config/db';
import User from '../server/models/User';
import Consultation from '../server/models/Consultation';
import UtmCampaign from '../server/models/UtmCampaign';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

async function ensureIndexes() {
  console.log('--- Ensuring MongoDB Schema Indexes ---');
  await connectToDatabase();

  console.log('Syncing User indexes (email unique, phone unique, createdAt)...');
  await User.createIndexes();

  console.log('Syncing Consultation indexes (userId)...');
  await Consultation.createIndexes();

  console.log('Syncing UtmCampaign indexes (userId, createdAt, compound)...');
  await UtmCampaign.createIndexes();

  console.log('✓ All database indexes verified and synced successfully');
}

ensureIndexes()
  .catch((err) => {
    console.error('Failed to sync database indexes:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
