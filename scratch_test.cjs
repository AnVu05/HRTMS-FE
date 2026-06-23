const http = require('http');

function testEndpoint(path, method, body = null) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          path,
          method,
          statusCode: res.statusCode,
          data: data.substring(0, 300)
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        method,
        error: err.message
      });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  const results = [];
  results.push(await testEndpoint('/api/v1/verifications/jockey-certs/6/reject', 'PUT'));
  results.push(await testEndpoint('/api/v1/verifications/jockey-certs/6/approve', 'PUT'));
  results.push(await testEndpoint('/api/v1/verifications/jockey-certs/6/accept', 'PUT'));
  results.push(await testEndpoint('/api/v1/verifications/jockey-certs/6/accept', 'POST'));

  console.log(JSON.stringify(results, null, 2));
}

runTests();
