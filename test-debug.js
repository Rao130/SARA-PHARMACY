// Quick test script to check order statuses
const fetch = require('node-fetch');

async function testDebugEndpoint() {
    try {
        // You'll need to replace this with a valid admin token
        const adminToken = 'YOUR_ADMIN_TOKEN_HERE';
        
        const response = await fetch('http://localhost:5006/api/v1/orders/debug/statuses', {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Debug Response:', JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testDebugEndpoint();