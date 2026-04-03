const axios = require('axios');

const test = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: `test_${Date.now()}@test.com`,
            password: 'password123',
            collegeId: 'TESTID123',
            university: 'Test University',
            phone: '1234567890',
            location: 'Test City',
            collegeIdImage: ''
        });
        console.log('✅ Registration SUCCESS:', res.data);
    } catch (error) {
        console.error('❌ Registration FAILED:', error.response?.data || error.message);
    }
};

test();
