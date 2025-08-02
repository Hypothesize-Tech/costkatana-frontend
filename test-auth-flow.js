// Quick test to verify authentication flow
// Run this in browser console after logging in:

console.log('🔍 Testing Authentication Flow...');

// Check if token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Test API call with authentication
fetch('/api/predictive-intelligence?scope=user&timeHorizon=30', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Response status:', response.status);
    return response.json();
})
.then(data => {
    console.log('✅ API Response:', data);
})
.catch(error => {
    console.log('❌ Error:', error);
});