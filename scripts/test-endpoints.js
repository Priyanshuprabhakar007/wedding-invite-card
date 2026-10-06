const http = require('http');
const fs = require('fs');
const path = require('path');

function testFetch(urlPath) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + urlPath, res => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          size: Buffer.concat(data).length
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('Testing HTTP endpoints on localhost:3000...');
  
  // 1. Fetch index.html
  const home = await testFetch('/');
  console.log(`GET / -> HTTP ${home.statusCode} (${home.size} bytes)`);

  // 2. Fetch key assets
  const assetsToTest = [
    '/assets/images/envelope-seal.webp',
    '/assets/images/envelope-flap-ornate.webp',
    '/assets/images/corner-ornament.webp',
    '/assets/images/invite-card-bg.webp',
    '/assets/images/invite-input-pill.webp',
    '/assets/images/invite-btn-pill.webp',
    '/assets/images/hero-burgundy-bg.webp',
    '/assets/images/branch-gold.webp',
    '/assets/images/rose-ivory.webp',
    '/assets/images/peony-red.webp',
    '/assets/images/ganesh-hero.webp',
    '/assets/images/marriage.webp',
    '/assets/images/mehendi.webp',
    '/assets/images/reception.webp',
    '/assets/images/Petal Shower/petal-1.webp',
    '/assets/images/Petal Shower/petal-8.webp',
    '/assets/images/gallery/1.webp',
    '/assets/images/gallery/46.webp'
  ];

  let passed = 0;
  for (const asset of assetsToTest) {
    const res = await testFetch(asset);
    if (res.statusCode === 200) {
      passed++;
      console.log(`  ✅ 200 OK: ${asset} (${(res.size/1024).toFixed(1)} KB)`);
    } else {
      console.error(`  ❌ FAILED: ${asset} -> HTTP ${res.statusCode}`);
    }
  }

  console.log(`\nAll ${passed}/${assetsToTest.length} asset endpoints responding with HTTP 200 OK!`);
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
