// Authentication Flow Test Script
const BASE_URL = 'http://localhost:4000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test@123456',
  role: 'Student',
  department: 'Computer Science'
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testSignup() {
  logSection('TEST 1: User Signup');
  
  try {
    log(`\nAttempting to signup with email: ${testUser.email}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    
    if (response.status === 200 && data.token) {
      log('✓ Signup successful!', 'green');
      log(`✓ Token received: ${data.token.substring(0, 20)}...`, 'green');
      log(`✓ User info: ${data.user.name} (${data.user.role})`, 'green');
      return { success: true, token: data.token, user: data.user };
    } else {
      log('✗ Signup failed!', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Error during signup: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLogin() {
  logSection('TEST 2: User Login');
  
  try {
    log(`\nAttempting to login with email: ${testUser.email}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    
    if (response.status === 200 && data.token) {
      log('✓ Login successful!', 'green');
      log(`✓ Token received: ${data.token.substring(0, 20)}...`, 'green');
      log(`✓ User info: ${data.user.name} (${data.user.role})`, 'green');
      return { success: true, token: data.token };
    } else {
      log('✗ Login failed!', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Error during login: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLoginWithWrongPassword() {
  logSection('TEST 3: Login with Wrong Password (Should Fail)');
  
  try {
    log(`\nAttempting to login with wrong password`, 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123'
      })
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 401 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    
    if (response.status === 401) {
      log('✓ Correctly rejected wrong password!', 'green');
      return { success: true };
    } else {
      log('✗ Should have rejected wrong password!', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Error during test: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testLoginWithNonExistentUser() {
  logSection('TEST 4: Login with Non-Existent User (Should Fail)');
  
  try {
    log(`\nAttempting to login with non-existent email`, 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'SomePassword123'
      })
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 401 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    
    if (response.status === 401) {
      log('✓ Correctly rejected non-existent user!', 'green');
      return { success: true };
    } else {
      log('✗ Should have rejected non-existent user!', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Error during test: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testDuplicateSignup() {
  logSection('TEST 5: Duplicate Signup (Should Fail)');
  
  try {
    log(`\nAttempting to signup with same email again`, 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 409 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    
    if (response.status === 409) {
      log('✓ Correctly rejected duplicate email!', 'green');
      return { success: true };
    } else {
      log('✗ Should have rejected duplicate email!', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Error during test: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testSignupWithMissingFields() {
  logSection('TEST 6: Signup with Missing Fields (Should Fail)');
  
  try {
    log(`\nAttempting to signup without password`, 'blue');
    
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test2@example.com'
      })
    });
    
    const data = await response.json();
    
    log(`Status: ${response.status}`, response.status === 400 ? 'green' : 'red');
    log(`Response: ${JSON.stringify(data, null, 2)}`, 'yellow');
    
    if (response.status === 400) {
      log('✓ Correctly rejected missing fields!', 'green');
      return { success: true };
    } else {
      log('✗ Should have rejected missing fields!', 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Error during test: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  logSection('AUTHENTICATION FLOW TEST SUITE');
  log('Starting comprehensive authentication tests...', 'blue');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Test 1: Signup
  const signupResult = await testSignup();
  results.total++;
  if (signupResult.success) results.passed++;
  else results.failed++;
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 2: Login
  const loginResult = await testLogin();
  results.total++;
  if (loginResult.success) results.passed++;
  else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 3: Wrong password
  const wrongPasswordResult = await testLoginWithWrongPassword();
  results.total++;
  if (wrongPasswordResult.success) results.passed++;
  else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 4: Non-existent user
  const nonExistentResult = await testLoginWithNonExistentUser();
  results.total++;
  if (nonExistentResult.success) results.passed++;
  else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 5: Duplicate signup
  const duplicateResult = await testDuplicateSignup();
  results.total++;
  if (duplicateResult.success) results.passed++;
  else results.failed++;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test 6: Missing fields
  const missingFieldsResult = await testSignupWithMissingFields();
  results.total++;
  if (missingFieldsResult.success) results.passed++;
  else results.failed++;
  
  // Summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed!`, 'red');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
