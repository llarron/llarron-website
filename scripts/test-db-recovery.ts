import mongoose from 'mongoose';
import connectToDatabase from '../server/config/db';
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

const REAL_MONGODB_URI = process.env.MONGODB_URI;

async function runRegressionTests() {
  console.log('--- Starting MongoDB Connection-Cache Recovery Regression Tests ---');

  // Test 1: First connection attempt fails -> resets cache promise and conn to null
  console.log('Test 1: Connection failure resets cache to null and rethrows error...');
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27099/non_existent_db?serverSelectionTimeoutMS=500&connectTimeoutMS=500';

  // Ensure cache starts clean
  if (global.mongooseCache) {
    global.mongooseCache.conn = null;
    global.mongooseCache.promise = null;
  }

  let firstErrorCaught: unknown = null;
  try {
    await connectToDatabase();
  } catch (err) {
    firstErrorCaught = err;
  }

  assert.ok(firstErrorCaught !== null, 'Expected first connection attempt with invalid URI to throw error');
  assert.strictEqual(global.mongooseCache?.promise, null, 'Expected cached.promise to be reset to null after failure');
  assert.strictEqual(global.mongooseCache?.conn, null, 'Expected cached.conn to be reset to null after failure');
  console.log('✓ Test 1 Passed: Failed connection reset cached.promise = null and cached.conn = null');

  // Test 2: Second attempt retries fresh connection instead of reusing rejected promise
  console.log('Test 2: Second attempt retries instead of reusing cached rejection...');
  if (!REAL_MONGODB_URI) {
    throw new Error('Missing MONGODB_URI in .env.local for live recovery verification');
  }

  process.env.MONGODB_URI = REAL_MONGODB_URI;
  const conn = await connectToDatabase();
  assert.ok(conn, 'Expected second connection attempt to succeed');
  assert.strictEqual(global.mongooseCache?.conn, conn, 'Expected cached.conn to hold successful connection');
  assert.ok(global.mongooseCache?.promise !== null, 'Expected cached.promise to be populated');
  console.log('✓ Test 2 Passed: Second connection attempt succeeded and populated cache');

  // Test 3: Subsequent call reuses existing cached connection
  console.log('Test 3: Subsequent call reuses cached connection...');
  const conn2 = await connectToDatabase();
  assert.strictEqual(conn2, conn, 'Expected subsequent call to return cached mongoose connection object');
  console.log('✓ Test 3 Passed: Cached connection reused without reconnecting');

  // Test 4: Concurrent requests share single pending connection promise
  console.log('Test 4: Concurrent requests share single pending promise...');
  // Disconnect and reset cache for controlled concurrency test
  await mongoose.disconnect();
  if (global.mongooseCache) {
    global.mongooseCache.conn = null;
    global.mongooseCache.promise = null;
  }

  const promises = [
    connectToDatabase(),
    connectToDatabase(),
    connectToDatabase(),
    connectToDatabase(),
  ];

  const results = await Promise.all(promises);
  assert.strictEqual(results.length, 4);
  assert.strictEqual(results[0], results[1]);
  assert.strictEqual(results[1], results[2]);
  assert.strictEqual(results[2], results[3]);
  console.log('✓ Test 4 Passed: Concurrent requests shared connection promise');

  // Test 5: Multiple failures followed by eventual recovery
  console.log('Test 5: Multiple sequential failures each clear cache, followed by clean recovery...');
  await mongoose.disconnect();
  if (global.mongooseCache) {
    global.mongooseCache.conn = null;
    global.mongooseCache.promise = null;
  }

  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27099/fake_db?serverSelectionTimeoutMS=300';
  for (let i = 1; i <= 3; i++) {
    let loopErr = null;
    try {
      await connectToDatabase();
    } catch (e) {
      loopErr = e;
    }
    assert.ok(loopErr !== null, `Attempt ${i} should have failed`);
    assert.strictEqual(global.mongooseCache?.promise, null, `Attempt ${i} should leave promise null`);
    assert.strictEqual(global.mongooseCache?.conn, null, `Attempt ${i} should leave conn null`);
  }

  // Restore URI and connect
  process.env.MONGODB_URI = REAL_MONGODB_URI;
  const recoveredConn = await connectToDatabase();
  assert.ok(recoveredConn, 'Recovery after multiple failures should succeed');
  assert.strictEqual(global.mongooseCache?.conn, recoveredConn);
  console.log('✓ Test 5 Passed: Multiple sequential failures cleared cache and recovered cleanly');

  console.log('--- All MongoDB Connection-Cache Recovery Tests Passed Successfully ---');
}

runRegressionTests()
  .catch((err) => {
    console.error('Test Suite Failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
