# SendBird API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Health Check
**GET** `/health`

Kiểm tra trạng thái server.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "SendBird API Server"
}
```

---

### 2. Lấy User Token
**GET** `/api/users/:userId/token`

Lấy access token cho user cụ thể.

**Parameters:**
- `userId` (path parameter): ID của user

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/users/User%202/token"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1642233600
  },
  "message": "Token retrieved successfully for user: User 2"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "User not found",
  "message": "Failed to get user token"
}
```

---

### 3. Tạo User Mới
**POST** `/api/users`

Tạo user mới với thông tin tùy chỉnh.

**Request Body:**
```json
{
  "user_id": "lala",
  "nickname": "Lala",
  "profile_url": "https://sendbird.com/main/img/profiles/profile_40_512px.png",
  "issue_access_token": true
}
```

**Required Fields:**
- `user_id` (string): ID duy nhất của user

**Optional Fields:**
- `nickname` (string): Tên hiển thị của user
- `profile_url` (string): URL avatar của user
- `issue_access_token` (boolean): Có tạo access token ngay không

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "lala",
    "nickname": "Lala",
    "profile_url": "https://sendbird.com/main/img/profiles/profile_40_512px.png",
    "issue_access_token": true
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "lala",
    "nickname": "Lala",
    "profile_url": "https://sendbird.com/main/img/profiles/profile_40_512px.png",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User created successfully"
}
```

---

### 4. Tạo User "Lala" (Convenience Endpoint)
**POST** `/api/users/lala`

Tạo user "lala" với data có sẵn.

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/users/lala"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "lala",
    "nickname": "Lala",
    "profile_url": "https://sendbird.com/main/img/profiles/profile_40_512px.png",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User \"lala\" created successfully"
}
```

---

### 5. Lấy Token cho "User 2" (Convenience Endpoint)
**GET** `/api/users/user2/token`

Lấy token cho user "User 2".

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/users/user2/token"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": 1642233600
  },
  "message": "Token retrieved successfully for User 2"
}
```

---

## Frontend Integration Examples

### JavaScript (Fetch API)

```javascript
// Lấy user token
async function getUserToken(userId) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(userId)}/token`);
    const data = await response.json();
    
    if (data.success) {
      return data.data.access_token;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error getting user token:', error);
    throw error;
  }
}

// Tạo user mới
async function createUser(userData) {
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Sử dụng
const token = await getUserToken('User 2');
console.log('User token:', token);

const newUser = await createUser({
  user_id: 'john_doe',
  nickname: 'John Doe',
  profile_url: 'https://example.com/avatar.jpg',
  issue_access_token: true
});
console.log('New user:', newUser);
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Lấy user token
async function getUserToken(userId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/token`);
    return response.data.data.access_token;
  } catch (error) {
    console.error('Error getting user token:', error.response?.data || error.message);
    throw error;
  }
}

// Tạo user mới
async function createUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error;
  }
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useSendBirdAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserToken = async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(userId)}/token`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.access_token;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getUserToken,
    createUser,
    loading,
    error
  };
}

// Sử dụng trong component
function UserComponent() {
  const { getUserToken, createUser, loading, error } = useSendBirdAPI();
  const [token, setToken] = useState(null);

  const handleGetToken = async () => {
    try {
      const userToken = await getUserToken('User 2');
      setToken(userToken);
    } catch (err) {
      console.error('Failed to get token:', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      const newUser = await createUser({
        user_id: 'john_doe',
        nickname: 'John Doe',
        profile_url: 'https://example.com/avatar.jpg',
        issue_access_token: true
      });
      console.log('User created:', newUser);
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <div>
      <button onClick={handleGetToken} disabled={loading}>
        Get User Token
      </button>
      <button onClick={handleCreateUser} disabled={loading}>
        Create User
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {token && <p>Token: {token}</p>}
    </div>
  );
}
```

## Error Handling

Tất cả endpoints đều trả về response với format thống nhất:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly error message"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created (for user creation)
- `400` - Bad Request (validation errors)
- `404` - Not Found (user not found, endpoint not found)
- `500` - Internal Server Error

## CORS

Server đã được cấu hình để hỗ trợ CORS, cho phép frontend từ bất kỳ origin nào có thể gọi API. 