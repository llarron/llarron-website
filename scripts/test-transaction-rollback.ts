import mongoose from 'mongoose';
import connectToDatabase from '../server/config/db';
import User from '../server/models/User';
import Consultation from '../server/models/Consultation';
import UtmCampaign from '../server/models/UtmCampaign';
import { UserRepository } from '../server/repositories/user.repository';
import * as assert from 'node:assert';
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

async function runRollbackTests() {
  console.log('--- Starting MongoDB Transaction Rollback & Atomicity Tests ---');
  await connectToDatabase();

  const repo = new UserRepository();
  const baseTimestamp = Date.now();

  // Test 1: User Write Failure (Duplicate key) -> No partial writes
  console.log('1. Testing User write stage failure & rollback...');
  const phone1 = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const email1 = `rollback_test_${baseTimestamp}_1@example.com`;

  // Pre-seed an existing user
  const initialUser = await repo.createUser(
    { name: 'Initial User', email: email1, phone: phone1, countryCode: '+91', timezone: 'Asia/Kolkata' },
    { utm_source: 'google', route: '/' },
    { interest: 'Life coaching', message: 'Initial message' }
  );
  assert.ok(initialUser._id, 'Initial user should be created');

  // Attempt duplicate user creation
  let dupErrorCaught = false;
  try {
    await repo.createUser(
      { name: 'Duplicate User', email: email1, phone: phone1, countryCode: '+91', timezone: 'Asia/Kolkata' },
      { utm_source: 'facebook', route: '/' },
      { interest: 'Vastu guidance', message: 'Duplicate attempt' }
    );
  } catch (err: unknown) {
    dupErrorCaught = true;
    assert.strictEqual((err as Error).message, 'USER_ALREADY_EXISTS');
  }
  assert.ok(dupErrorCaught, 'Expected duplicate creation to fail');

  // Verify no orphan consultation was created for the duplicate attempt
  const dupConsultations = await Consultation.find({ message: 'Duplicate attempt' });
  assert.strictEqual(dupConsultations.length, 0, 'No orphan consultation should exist after duplicate error');
  console.log('✓ Pass: User stage failure cleanly rejected with zero partial writes');

  // Test 2: Consultation Write Failure -> Complete Rollback of User & UTM
  console.log('2. Testing Consultation write failure -> complete rollback of User and UTM...');
  const phone2 = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const email2 = `rollback_test_${baseTimestamp}_2@example.com`;

  const session2 = await mongoose.startSession();
  let consultErrorCaught = false;
  try {
    await session2.withTransaction(async () => {
      const [u] = await User.create([{
        name: 'Rollback User 2',
        email: email2,
        phone: phone2,
        countryCode: '+91',
        timezone: 'Asia/Kolkata',
      }], { session: session2 });

      await UtmCampaign.create([{
        userId: u._id,
        utm_source: 'test_campaign_2',
        route: '/',
      }], { session: session2 });

      // Intentionally cause failure at Consultation stage
      throw new Error('SIMULATED_CONSULTATION_WRITE_FAILURE');
    });
  } catch (err: unknown) {
    consultErrorCaught = true;
    assert.strictEqual((err as Error).message, 'SIMULATED_CONSULTATION_WRITE_FAILURE');
  } finally {
    await session2.endSession();
  }
  assert.ok(consultErrorCaught, 'Expected simulated error to be thrown');

  // Verify User 2 and UTM 2 were rolled back and DO NOT exist in database
  const rolledBackUser2 = await User.findOne({ email: email2 });
  assert.strictEqual(rolledBackUser2, null, 'User 2 document MUST be rolled back and not found');
  const rolledBackUtm2 = await UtmCampaign.findOne({ utm_source: 'test_campaign_2' });
  assert.strictEqual(rolledBackUtm2, null, 'UTM 2 document MUST be rolled back and not found');
  console.log('✓ Pass: Consultation failure rolled back User and UTM documents completely');

  // Test 3: UTM Write Failure -> Complete Rollback of User & Consultation
  console.log('3. Testing UTM write failure -> complete rollback of User and Consultation...');
  const phone3 = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const email3 = `rollback_test_${baseTimestamp}_3@example.com`;

  const session3 = await mongoose.startSession();
  let utmErrorCaught = false;
  try {
    await session3.withTransaction(async () => {
      const [u] = await User.create([{
        name: 'Rollback User 3',
        email: email3,
        phone: phone3,
        countryCode: '+91',
        timezone: 'Asia/Kolkata',
      }], { session: session3 });

      await Consultation.create([{
        userId: u._id,
        interest: 'Numerology',
        message: 'Rollback test 3 message',
      }], { session: session3 });

      // Intentionally cause failure at UTM stage
      throw new Error('SIMULATED_UTM_WRITE_FAILURE');
    });
  } catch (err: unknown) {
    utmErrorCaught = true;
    assert.strictEqual((err as Error).message, 'SIMULATED_UTM_WRITE_FAILURE');
  } finally {
    await session3.endSession();
  }
  assert.ok(utmErrorCaught, 'Expected simulated UTM error to be thrown');

  // Verify User 3 and Consultation 3 were rolled back and DO NOT exist in database
  const rolledBackUser3 = await User.findOne({ email: email3 });
  assert.strictEqual(rolledBackUser3, null, 'User 3 document MUST be rolled back and not found');
  const rolledBackConsult3 = await Consultation.findOne({ message: 'Rollback test 3 message' });
  assert.strictEqual(rolledBackConsult3, null, 'Consultation 3 document MUST be rolled back and not found');
  console.log('✓ Pass: UTM failure rolled back User and Consultation documents completely');

  // Test 4: Returning User Update Rollback on Failure
  console.log('4. Testing Returning User update failure -> rollback demographic changes and writes...');
  const phone4 = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const email4 = `rollback_test_${baseTimestamp}_4@example.com`;

  const user4 = await repo.createUser(
    { name: 'Original Name', email: email4, phone: phone4, countryCode: '+91', timezone: 'Asia/Kolkata' },
    { utm_source: 'original_source', route: '/' },
    { interest: 'Holistic wellness', message: 'Original inquiry' }
  );

  const session4 = await mongoose.startSession();
  try {
    await session4.withTransaction(async () => {
      await User.findByIdAndUpdate(
        user4._id,
        { $set: { name: 'Attempted Modified Name' } },
        { session: session4 }
      );

      await Consultation.create([{
        userId: user4._id,
        interest: 'Life coaching',
        message: 'Attempted consultation 4',
      }], { session: session4 });

      // Throw error before commit
      throw new Error('SIMULATED_RETURNING_USER_FAILURE');
    });
  } catch (err: unknown) {
    assert.strictEqual((err as Error).message, 'SIMULATED_RETURNING_USER_FAILURE');
  } finally {
    await session4.endSession();
  }

  // Verify original name was preserved (not mutated) and no second consultation was saved
  const fetchedUser4 = await User.findById(user4._id);
  assert.strictEqual(fetchedUser4?.name, 'Original Name', 'User name MUST retain original value after rollback');
  const consults4 = await Consultation.find({ userId: user4._id });
  assert.strictEqual(consults4.length, 1, 'Only original consultation should exist');
  console.log('✓ Pass: Returning user failure preserved original state without partial mutations');

  // Test 5: Successful Atomic Writes & Multi-Touchpoint Attribution
  console.log('5. Testing successful atomic creation and multi-touchpoint attribution...');
  const phone5 = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
  const email5 = `rollback_test_${baseTimestamp}_5@example.com`;

  const user5 = await repo.createUser(
    { name: 'User 5 First Visit', email: email5, phone: phone5, countryCode: '+91', timezone: 'Asia/Kolkata' },
    { utm_source: 'google', utm_campaign: 'summer_wellness', route: '/' },
    { interest: 'Life coaching', message: 'First consultation' }
  );

  assert.ok(user5._id);
  const u5ConsultsFirst = await Consultation.find({ userId: user5._id });
  const u5UtmFirst = await UtmCampaign.find({ userId: user5._id });
  assert.strictEqual(u5ConsultsFirst.length, 1);
  assert.strictEqual(u5UtmFirst.length, 1);

  // Multi-touchpoint update
  await repo.updateExistingUser(
    user5._id as mongoose.Types.ObjectId,
    { name: 'User 5 Updated Demographics', countryCode: '+91', timezone: 'Asia/Kolkata' },
    { utm_source: 'newsletter', utm_campaign: 'autumn_renewal', route: '/programs' },
    { interest: 'Vastu guidance', message: 'Second consultation' }
  );

  const u5Updated = await User.findById(user5._id);
  assert.strictEqual(u5Updated?.name, 'User 5 Updated Demographics');
  const u5ConsultsSecond = await Consultation.find({ userId: user5._id });
  const u5UtmSecond = await UtmCampaign.find({ userId: user5._id });
  assert.strictEqual(u5ConsultsSecond.length, 2, 'Two consultations recorded for returning user');
  assert.strictEqual(u5UtmSecond.length, 2, 'Two UTM attribution records recorded for returning user');
  console.log('✓ Pass: Atomic creation and multi-touchpoint attribution verified');

  console.log('--- All MongoDB Transaction Rollback & Atomicity Tests Passed Successfully ---');
}

runRollbackTests()
  .catch((err) => {
    console.error('Transaction Rollback Suite Failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
