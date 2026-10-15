// WildBugs Comprehensive Test Suite
const BASE_URL = 'http://localhost:3001/api';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    results.push(`✅ PASS: ${testName}`);
    console.log(`✅ PASS: ${testName}`);
  } else {
    failed++;
    results.push(`❌ FAIL: ${testName} - ${details}`);
    console.error(`❌ FAIL: ${testName} - ${details}`);
  }
}

async function runTests() {
  console.log('\n--- 🧪 STARTING WILDBUGS AUTOMATED TEST SUITE ---\n');

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(res.status === 200 && data.status === 'ok', 'Health Check /api/health');
  } catch (err) {
    assert(false, 'Health Check /api/health', err.message);
  }

  // 2. Species Catalog
  let allSpecies = [];
  try {
    const res = await fetch(`${BASE_URL}/species`);
    const data = await res.json();
    allSpecies = data.species || [];
    assert(res.status === 200 && allSpecies.length >= 15, 'GET /api/species returns 15+ species', `Count: ${allSpecies.length}`);
  } catch (err) {
    assert(false, 'GET /api/species', err.message);
  }

  // 2b. Species Search
  try {
    const res = await fetch(`${BASE_URL}/species?search=monarch`);
    const data = await res.json();
    const hasMonarch = data.species?.some(s => s.commonName.toLowerCase().includes('monarch'));
    assert(res.status === 200 && hasMonarch, 'GET /api/species?search=monarch');
  } catch (err) {
    assert(false, 'GET /api/species?search=monarch', err.message);
  }

  // 2c. Species Details by ID & 404 on invalid ID
  try {
    const validId = allSpecies[0]?.id;
    const resValid = await fetch(`${BASE_URL}/species/${validId}`);
    assert(resValid.status === 200, `GET /api/species/${validId} returns 200`);

    const resInvalid = await fetch(`${BASE_URL}/species/99999`);
    assert(resInvalid.status === 404, 'GET /api/species/99999 returns 404');
  } catch (err) {
    assert(false, 'Species Detail & 404 check', err.message);
  }

  // 3. Auth Flow: Login with demo account
  let userToken = '';
  let testUserId = '';
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@wildbugs.org', password: 'password123' }),
    });
    const data = await res.json();
    userToken = data.token;
    testUserId = data.user?.id;
    assert(res.status === 200 && !!userToken, 'POST /api/auth/login with demo account');
  } catch (err) {
    assert(false, 'POST /api/auth/login', err.message);
  }

  // 3b. Auth: Check /api/auth/me
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.user?.email === 'demo@wildbugs.org', 'GET /api/auth/me with valid Bearer token');
  } catch (err) {
    assert(false, 'GET /api/auth/me', err.message);
  }

  // 3c. Auth: Rejection of invalid password
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@wildbugs.org', password: 'wrongpassword' }),
    });
    assert(res.status === 401, 'POST /api/auth/login with wrong password returns 401');
  } catch (err) {
    assert(false, 'POST /api/auth/login invalid credentials check', err.message);
  }

  // 4. Sightings Feed & Temporal Filters
  let sampleSighting = null;
  try {
    const resAll = await fetch(`${BASE_URL}/sightings?timeframe=all`);
    const dataAll = await resAll.json();
    sampleSighting = dataAll.sightings?.[0];
    assert(resAll.status === 200 && Array.isArray(dataAll.sightings), 'GET /api/sightings?timeframe=all');

    const res30d = await fetch(`${BASE_URL}/sightings?timeframe=30d`);
    assert(res30d.status === 200, 'GET /api/sightings?timeframe=30d');

    const res7d = await fetch(`${BASE_URL}/sightings?timeframe=7d`);
    assert(res7d.status === 200, 'GET /api/sightings?timeframe=7d');
  } catch (err) {
    assert(false, 'GET /api/sightings filters', err.message);
  }

  // 4b. Sighting Detail by ID & 404 test
  if (sampleSighting) {
    try {
      const res = await fetch(`${BASE_URL}/sightings/${sampleSighting.id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      assert(
        res.status === 200 &&
        typeof data.likeCount === 'number' &&
        typeof data.hasLiked === 'boolean' &&
        typeof data.verificationCount === 'number',
        `GET /api/sightings/${sampleSighting.id} returns likeCount & verificationCount`
      );
    } catch (err) {
      assert(false, 'GET /api/sightings/:id', err.message);
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/sightings/non-existent-uuid-12345`);
    assert(res.status === 404, 'GET /api/sightings/:invalidId returns 404');
  } catch (err) {
    assert(false, 'GET /api/sightings/:invalidId 404 check', err.message);
  }

  // 5. Social Features: Like, Comment, Verify
  if (sampleSighting) {
    // 5a. Like Toggle
    try {
      const resLike = await fetch(`${BASE_URL}/sightings/${sampleSighting.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const dataLike = await resLike.json();
      assert(resLike.status === 200 && typeof dataLike.likeCount === 'number', 'POST /api/sightings/:id/like toggle');

      // Toggle back to preserve state
      await fetch(`${BASE_URL}/sightings/${sampleSighting.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
    } catch (err) {
      assert(false, 'POST /api/sightings/:id/like', err.message);
    }

    // 5b. Comment on sighting
    try {
      const commentRes = await fetch(`${BASE_URL}/sightings/${sampleSighting.id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Remarkable specimen captured!' }),
      });
      const commentData = await commentRes.json();
      assert(commentRes.status === 201 && commentData.comment?.content === 'Remarkable specimen captured!', 'POST /api/sightings/:id/comments');
    } catch (err) {
      assert(false, 'POST /api/sightings/:id/comments', err.message);
    }

    // 5c. Comment validation: empty content
    try {
      const emptyRes = await fetch(`${BASE_URL}/sightings/${sampleSighting.id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: '   ' }),
      });
      assert(emptyRes.status === 400, 'POST /api/sightings/:id/comments with empty body returns 400');
    } catch (err) {
      assert(false, 'POST /api/sightings/:id/comments empty validation', err.message);
    }

    // 5d. Peer Verification toggle
    try {
      const verifyRes = await fetch(`${BASE_URL}/sightings/${sampleSighting.id}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const verifyData = await verifyRes.json();
      assert(verifyRes.status === 200 && typeof verifyData.verificationCount === 'number', 'POST /api/sightings/:id/verify toggle');
    } catch (err) {
      assert(false, 'POST /api/sightings/:id/verify', err.message);
    }
  }

  // 6. CSV Export endpoint
  try {
    const csvRes = await fetch(`${BASE_URL}/sightings/export/csv`);
    const csvText = await csvRes.text();
    assert(
      csvRes.status === 200 &&
      csvRes.headers.get('content-type')?.includes('text/csv') &&
      csvText.startsWith('id,observerName,commonName'),
      'GET /api/sightings/export/csv generates valid CSV with correct headers'
    );
  } catch (err) {
    assert(false, 'GET /api/sightings/export/csv', err.message);
  }

  // 7. Challenges & Leaderboard
  try {
    const chRes = await fetch(`${BASE_URL}/challenges`);
    const chData = await chRes.json();
    assert(chRes.status === 200 && Array.isArray(chData.challenges), 'GET /api/challenges returns challenge list');

    const lbRes = await fetch(`${BASE_URL}/users/leaderboard`);
    const lbData = await lbRes.json();
    assert(lbRes.status === 200 && Array.isArray(lbData.leaderboard), 'GET /api/users/leaderboard returns ranked users');
  } catch (err) {
    assert(false, 'Challenges & Leaderboard endpoints', err.message);
  }

  // 8. Admin & Expert Governance
  let expertToken = '';
  try {
    // Elevate demo user to expert
    const promoteRes = await fetch(`${BASE_URL}/admin/promote-me`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'expert' }),
    });
    const promoteData = await promoteRes.json();
    expertToken = promoteData.token;
    assert(promoteRes.status === 200 && promoteData.user?.role === 'expert', 'POST /api/admin/promote-me to expert');

    // Fetch Admin Metrics
    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${expertToken}` },
    });
    const metricsData = await metricsRes.json();
    assert(
      metricsRes.status === 200 &&
      typeof metricsData.metrics?.totalSightings === 'number' &&
      typeof metricsData.metrics?.verifiedRate === 'number',
      'GET /api/admin/metrics returns platform metrics'
    );

    // Fetch Pending Verifications queue
    const queueRes = await fetch(`${BASE_URL}/admin/pending-verifications`, {
      headers: { Authorization: `Bearer ${expertToken}` },
    });
    const queueData = await queueRes.json();
    assert(queueRes.status === 200 && Array.isArray(queueData.sightings), 'GET /api/admin/pending-verifications returns queue');
  } catch (err) {
    assert(false, 'Admin & Expert Governance Suite', err.message);
  }

  // 9. Unauthorized access protection test
  try {
    const unauthMetrics = await fetch(`${BASE_URL}/admin/metrics`);
    assert(unauthMetrics.status === 401, 'GET /api/admin/metrics without auth returns 401');

    const unauthVerify = await fetch(`${BASE_URL}/sightings/some-id/verify`, { method: 'POST' });
    assert(unauthVerify.status === 401, 'POST /api/sightings/:id/verify without auth returns 401');
  } catch (err) {
    assert(false, 'Security & Unauthenticated access checks', err.message);
  }

  // 10. End-to-End Observation Lifecycle: Upload -> AI Match -> Expert Certify -> Purge
  try {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    // Create minimal 1x1 GIF byte buffer
    const gifBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    
    // Construct FormData using standard Node 18+ FormData & Blob
    const formData = new FormData();
    const fileBlob = new Blob([gifBuffer], { type: 'image/gif' });
    formData.append('photo', fileBlob, 'field-test.gif');
    formData.append('latitude', '28.5355');
    formData.append('longitude', '77.3910');
    formData.append('notes', 'Automated integration test specimen on damp leaf');

    const uploadRes = await fetch(`${BASE_URL}/sightings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    const newSightingId = uploadData.sighting?.id;

    assert(
      uploadRes.status === 201 &&
      !!newSightingId &&
      typeof uploadData.confidence === 'number' &&
      Array.isArray(uploadData.candidates) &&
      uploadData.candidates.length === 3,
      'POST /api/sightings upload returns 201 with AI Top-3 candidates'
    );

    // Certify with Expert Role
    const certifyRes = await fetch(`${BASE_URL}/admin/sightings/${newSightingId}/expert-verify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${expertToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const certifyData = await certifyRes.json();
    assert(
      certifyRes.status === 200 &&
      certifyData.sighting?.status === 'expert_verified',
      'POST /api/admin/sightings/:id/expert-verify upgrades status to expert_verified'
    );

    // Purge / Clean Up test sighting
    const deleteRes = await fetch(`${BASE_URL}/admin/sightings/${newSightingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${expertToken}` },
    });
    const deleteData = await deleteRes.json();
    assert(
      deleteRes.status === 200 &&
      deleteData.deletedId === newSightingId,
      'DELETE /api/admin/sightings/:id cleanly purges test specimen'
    );

    // Verify it is gone (404)
    const checkGone = await fetch(`${BASE_URL}/sightings/${newSightingId}`);
    assert(checkGone.status === 404, 'Verified purged sighting returns 404');
  } catch (err) {
    assert(false, 'End-to-End Observation Lifecycle test', err.message);
  }

  console.log('\n--- 📊 TEST RESULTS SUMMARY ---');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ALL AUTOMATED TESTS PASSED WITH ZERO FAILURES!\n');
  } else {
    console.error(`⚠️ ${failed} TEST(S) FAILED. INVESTIGATION REQUIRED.\n`);
  }
}

runTests();
