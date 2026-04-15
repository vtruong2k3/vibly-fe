const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:8000/api/v1/auth/register', {
      email: 'vutruong2k3@gmail.com',
      username: 'vutruong',
      password: 'Truong142003@',
      displayName: 'Vũ Văn Trường'
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('API ERROR:', err.response.status, err.response.data);
    } else {
      console.log('NETWORK ERROR:', err.message);
    }
  }
}

testRegister();
