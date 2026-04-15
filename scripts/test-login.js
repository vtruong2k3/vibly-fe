const fetch = require('node-fetch');

async function test() {
  // 1. Try to login as an unverified user
  console.log('Testing login...');
  const res = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'vutruong1405003@gmail.com', password: 'Password123!' })
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  if (data.data?.accessToken) {
    console.log('Got access token! Testing /users/me...');
    const meRes = await fetch('http://localhost:8000/api/v1/users/me', {
       headers: { 'Authorization': `Bearer ${data.data.accessToken}` }
    });
    const meData = await meRes.json();
    console.log('/users/me response:');
    console.log(JSON.stringify(meData, null, 2));
  }
}

test();
