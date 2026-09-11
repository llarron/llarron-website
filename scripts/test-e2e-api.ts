import * as assert from 'node:assert';

async function testApiEndpoints() {
  console.log('--- Starting Live E2E API Verification on http://localhost:3000 ---');

  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const phoneSuffixA = Math.floor(10000 + Math.random() * 90000);
  const phoneSuffixB = Math.floor(10000 + Math.random() * 90000);

  const userAEmail = `test_recovery_${timestamp}_a@example.com`;
  const userAPhone = `98765${phoneSuffixA}`;

  const userBEmail = `test_recovery_${timestamp}_b@example.com`;
  const userBPhone = `98765${phoneSuffixB}`;

  // 1. GET /api/user-details should return 404
  console.log('1. Verifying disabled GET /api/user-details returns 404...');
  const resUserDetails = await fetch(`${baseUrl}/api/user-details`);
  assert.strictEqual(resUserDetails.status, 404, `Expected 404 for /api/user-details, got ${resUserDetails.status}`);
  console.log('✓ Pass: GET /api/user-details returned 404');

  // 2. POST /api/signup - New User A
  console.log('2. Verifying POST /api/signup for new User A returns 201 Created...');
  const resSignupA = await fetch(`${baseUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User A',
      email: userAEmail,
      phone: userAPhone,
      countryCode: '+91',
      interest: 'Sleep Support',
      message: 'Looking for consultation regarding insomnia',
      route: '/',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'summer_wellness',
      gclid: 'gclid_test_12345',
    }),
  });

  const dataSignupA = await resSignupA.json();
  assert.strictEqual(resSignupA.status, 201, `Expected 201 for new user, got ${resSignupA.status}: ${JSON.stringify(dataSignupA)}`);
  assert.strictEqual(dataSignupA.success, true);
  assert.strictEqual(dataSignupA.data?.status, 'new');
  console.log('✓ Pass: POST /api/signup created new user with 201 Created');

  // 3. POST /api/signup - New User B
  console.log('3. Verifying POST /api/signup for new User B returns 201 Created...');
  const resSignupB = await fetch(`${baseUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User B',
      email: userBEmail,
      phone: userBPhone,
      countryCode: '+91',
      interest: 'Stress & Anxiety',
      message: 'Need help with stress management',
      route: '/',
      utm_source: 'meta',
      utm_campaign: 'instagram_reels',
      fbclid: 'fbclid_test_98765',
    }),
  });

  const dataSignupB = await resSignupB.json();
  assert.strictEqual(resSignupB.status, 201, `Expected 201 for User B, got ${resSignupB.status}: ${JSON.stringify(dataSignupB)}`);
  assert.strictEqual(dataSignupB.success, true);
  assert.strictEqual(dataSignupB.data?.status, 'new');
  console.log('✓ Pass: POST /api/signup created User B with 201 Created');

  // 4. POST /api/signup - Existing User A with new campaign touchpoint
  console.log('4. Verifying multi-touchpoint update for User A returns 200 OK...');
  const resSignupExistingA = await fetch(`${baseUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User A Updated',
      email: userAEmail,
      phone: userAPhone,
      countryCode: '+91',
      interest: 'Deep Alignment',
      message: 'Following up on alignment options',
      route: '/programs',
      utm_source: 'newsletter',
      utm_medium: 'email',
      utm_campaign: 'autumn_renewal',
    }),
  });

  const dataSignupExistingA = await resSignupExistingA.json();
  assert.strictEqual(resSignupExistingA.status, 200, `Expected 200 for existing user touchpoint, got ${resSignupExistingA.status}`);
  assert.strictEqual(dataSignupExistingA.success, true);
  assert.strictEqual(dataSignupExistingA.data?.status, 'existing');
  console.log('✓ Pass: POST /api/signup handled multi-touchpoint with 200 OK');

  // 5. POST /api/signup - Split Match Conflict (User A email + User B phone)
  console.log('5. Verifying split email/phone match returns 409 Conflict...');
  const resConflict = await fetch(`${baseUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Split Conflict User',
      email: userAEmail,
      phone: userBPhone,
      countryCode: '+91',
      interest: 'Stress & Anxiety',
      message: 'Conflict check',
    }),
  });

  const dataConflict = await resConflict.json();
  assert.strictEqual(resConflict.status, 409, `Expected 409 Conflict, got ${resConflict.status}: ${JSON.stringify(dataConflict)}`);
  assert.strictEqual(dataConflict.success, false);
  assert.strictEqual(dataConflict.code, 'USER_CONFLICT');
  console.log('✓ Pass: POST /api/signup detected split match and returned 409 Conflict');

  // 6. POST /api/signup - Invalid input validation error
  console.log('6. Verifying invalid phone format returns 400 Bad Request...');
  const resInvalid = await fetch(`${baseUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Invalid User',
      email: 'invalid-email-format',
      phone: '12345', // Invalid phone
      countryCode: '+91',
      interest: '',
    }),
  });

  const dataInvalid = await resInvalid.json();
  assert.strictEqual(resInvalid.status, 400, `Expected 400 Bad Request, got ${resInvalid.status}`);
  assert.strictEqual(dataInvalid.success, false);
  console.log('✓ Pass: POST /api/signup rejected invalid payload with 400 Bad Request');

  console.log('--- All Live E2E API Tests Passed Successfully! ---');
}

testApiEndpoints().catch((err) => {
  console.error('Live E2E Verification Failed:', err);
  process.exit(1);
});
