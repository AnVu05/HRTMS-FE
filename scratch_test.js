const http = require('http');

http.get('http://localhost:8080/api/v1/verifications/jockey-certs/6/images', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('STATUS:', json.status);
      console.log('MESSAGE:', json.message);
      if (json.data && json.data.length > 0) {
        console.log('KEYS OF FIRST ITEM:', Object.keys(json.data[0]));
        console.log('FIRST ITEM DETAILS (WITHOUT LARGE BASE64):');
        const item = { ...json.data[0] };
        if (item.cert_image_base64) {
          item.cert_image_base64 = item.cert_image_base64.substring(0, 30) + '...';
        }
        console.log(JSON.stringify(item, null, 2));
      } else {
        console.log('No data items found.');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw data:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
