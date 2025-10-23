# 🔍 Debugging 403 Forbidden Errors - Hospital Module

## Problem Summary
The Hospital Module pages load successfully but API calls to endpoints like `/api/hospitalar/filas` and `/api/hospitalar/leitos` return **403 Forbidden** errors, even for Master Administrators who should have full access.

## How to Debug

### Step 1: Use the Debug Tool
1. Open `debug_403_errors.html` in your browser
2. The tool will automatically run initial checks
3. Click the diagnostic buttons to gather information:
   - **Check Authentication State** - Verifies login status
   - **Check Local Storage** - Shows stored tokens and user data
   - **Validate Token** - Decodes JWT and checks expiration
   - **Test Hospital API** - Makes direct API calls to identify issues

### Step 2: Analyze Results

#### Scenario A: No Token Found ❌
**Symptoms:**
- "No token found in localStorage"
- Missing operador data

**Solution:**
```javascript
// The user is not properly logged in
// Clear storage and login again
localStorage.clear();
// Navigate to /login and authenticate
```

#### Scenario B: Token Expired ❌
**Symptoms:**
- Token exists but shows "Expired" status
- Token `exp` claim is in the past

**Solution:**
```javascript
// Clear expired tokens and re-login
['token', 'authToken', 'access_token', 'operadorData'].forEach(key => {
    localStorage.removeItem(key);
});
// Navigate to /login
```

#### Scenario C: Invalid Token Format ❌
**Symptoms:**
- "Error decoding token" message
- Token doesn't have 3 parts (header.payload.signature)

**Solution:**
```javascript
// Token is corrupted, clear and re-login
localStorage.clear();
// Navigate to /login
```

#### Scenario D: Valid Token but 403 Errors ⚠️
**Symptoms:**
- Token is valid and not expired
- User data exists with `isMaster: true`
- API calls still return 403

**Potential Causes & Solutions:**

1. **Backend Token Validation Issue:**
   ```java
   // Check JwtService.validateToken() and isTokenValid() methods
   // Verify token signature validation
   ```

2. **User Not Found in Database:**
   ```java
   // Check if the user exists in the database
   // Verify UserDetailsService.loadUserByUsername()
   ```

3. **Authorization Header Not Sent:**
   ```javascript
   // Check browser Network tab
   // Verify Authorization: Bearer <token> is present
   ```

4. **Token Claims Mismatch:**
   ```javascript
   // Compare token payload with backend expectations
   // Check username/login field in token vs database
   ```

### Step 3: Implement Fix Based on Results

#### If authentication issues (Scenarios A, B, C):
1. Clear localStorage
2. Navigate to login page
3. Authenticate with Master Administrator credentials
4. Verify token is properly stored

#### If backend validation issues (Scenario D):
1. Check backend logs for specific error messages
2. Verify JWT secret configuration
3. Check database connectivity
4. Validate user permissions

## Manual Testing

After identifying the issue, test manually:

1. **Login with Master Admin:**
   ```
   Username: admin.master (or similar)
   Password: [your admin password]
   ```

2. **Check Browser Developer Tools:**
   - Network tab: Verify `Authorization: Bearer <token>` header
   - Console: Look for authentication errors
   - Application tab: Check localStorage for token

3. **Test API Endpoint Directly:**
   ```javascript
   fetch('http://localhost:8080/api/hospitalar/status', {
       headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`,
           'Content-Type': 'application/json'
       }
   }).then(r => r.json()).then(console.log);
   ```

## Expected Flow

1. ✅ User logs in with Master Administrator credentials
2. ✅ JWT token is generated and stored in localStorage
3. ✅ OperadorContext sets `isMaster: true`
4. ✅ API requests include `Authorization: Bearer <token>` header
5. ✅ Backend validates token and authenticates user
6. ✅ Hospital Module endpoints return data successfully

## Quick Fixes

### Fix 1: Clear Auth and Re-login
```javascript
// Clear all authentication data
['token', 'authToken', 'access_token', 'operadorData', 'user'].forEach(key => {
    localStorage.removeItem(key);
});
// Refresh page and login again
location.reload();
```

### Fix 2: Manually Set Authorization Header
```javascript
// If apiService is not setting headers properly
import apiService from '@/services/apiService';
const token = localStorage.getItem('token');
apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Fix 3: Check Backend Logs
```bash
# Check backend logs for authentication errors
tail -f backend/logs/saude-instance1.log | grep -i "authentication\|jwt\|403"
```

## Success Criteria

After fixing the issue:
- ✅ Debug tool shows valid token and user data
- ✅ API test returns 200 OK for Hospital endpoints
- ✅ Hospital Module pages load data without 403 errors
- ✅ All buttons and interactions work properly

---

**Next Steps:** Run the debug tool, analyze the results, and apply the appropriate fix based on your specific scenario.