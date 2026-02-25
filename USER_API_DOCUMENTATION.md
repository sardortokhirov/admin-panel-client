# User Management API Documentation

## Authentication
All endpoints require **Basic Authentication**:
- **Header**: `Authorization: Basic TWF4VXAxMDAwOk1heFVwMTAwMA==`
- **Credentials**: `MaxUp1000:MaxUp1000998905982808`

---

## 1. Users List Page APIs

### 1.1 Get Users List (Paginated with Filters)
**Endpoint**: `GET /api/users`

**Purpose**: Get paginated list of users with filtering options

**Query Parameters**:
- `page` (int, default: 0) - Page number (0-indexed)
- `size` (int, default: 20, max: 100) - Number of items per page
- `blocked` (Boolean, optional) - Filter by blocked status (true/false)
- `language` (String, optional) - Filter by language ("UZ" or "RU")
- `hasBalance` (Boolean, optional) - Filter by users with balance (true/false)
- `searchChatId` (Long, optional) - Search by exact chat ID
- `searchPhone` (String, optional) - Search by phone number (partial match)

**Example Request**:
```
GET /api/users?page=0&size=20&blocked=false&language=UZ&hasBalance=true
```
 
**Response**: `Page<UserDTO>`
```json
{
  "content": [
    {
      "chatId": 123456789,
      "language": "UZ",
      "phoneNumber": "+998901234567",
      "isBlocked": false,
      "balance": 50000.00,
      "tickets": 10,
      "registeredAt": "2024-01-15T10:30:00",
      "permanentLimitIncrease": 25000,
      "effectiveDailyLimit": 150000,
      "availableLimit": 120000,
      "platformsUsed": ["Mostbet", "1xBet"]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true,
  "numberOfElements": 20
}
```

**UserDTO Fields**:
- `chatId` (Long) - User's Telegram chat ID
- `language` (String) - User's language preference ("UZ" or "RU")
- `phoneNumber` (String) - User's phone number (null if not set, "BLOCKED" if blocked)
- `isBlocked` (Boolean) - Whether user is blocked
- `balance` (BigDecimal) - User's bonus balance
- `tickets` (Long) - User's lottery tickets
- `registeredAt` (LocalDateTime) - Registration date (earliest request date)
- `permanentLimitIncrease` (Long) - Permanent limit increase amount
- `effectiveDailyLimit` (Long) - Effective daily limit (base + permanent + daily increase)
- `availableLimit` (Long) - Available limit for today
- `platformsUsed` (List<String>) - List of platforms user has used

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 1.2 Bulk Block Users
**Endpoint**: `POST /api/users/bulk-block`

**Purpose**: Block multiple users at once

**Request Body**:
```json
{
  "chatIds": [123456789, 987654321, 555666777]
}
```

**Response**: Success message with count
```json
"Bulk block completed. Blocked: 3 users. IDs: [123456789, 987654321, 555666777]"
```

**Status Codes**:
- `200 OK` - Success (may have partial success)
- `400 Bad Request` - Empty chatIds list
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 1.3 Bulk Unblock Users
**Endpoint**: `POST /api/users/bulk-unblock`

**Purpose**: Unblock multiple users at once

**Request Body**:
```json
{
  "chatIds": [123456789, 987654321, 555666777]
}
```

**Response**: Success message with count
```json
"Bulk unblock completed. Unblocked: 2 users. IDs: [123456789, 987654321]"
```

**Status Codes**:
- `200 OK` - Success (may have partial success)
- `400 Bad Request` - Empty chatIds list
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

## 2. User Profile Page APIs

### 2.1 Get User Details
**Endpoint**: `GET /api/users/{chatId}`

**Purpose**: Get detailed information about a single user

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Example Request**:
```
GET /api/users/123456789
```

**Response**: `UserDetailDTO`
```json
{
  "chatId": 123456789,
  "language": "UZ",
  "phoneNumber": "+998901234567",
  "isBlocked": false,
  "balance": 50000.00,
  "tickets": 10,
  "registeredAt": "2024-01-15T10:30:00",
  "permanentLimitIncrease": 25000,
  "effectiveDailyLimit": 150000,
  "availableLimit": 120000,
  "platformsUsed": ["Mostbet", "1xBet"],
  "dailyTopUpAmount": 500000,
  "dailyTransferAmount": 300000,
  "dailyLimitIncrease": 10000,
  "lastLotteryPlayTime": "2024-01-20T14:30:00",
  "lastUpdated": "2024-01-20T15:00:00"
}
```

**UserDetailDTO Additional Fields** (beyond UserDTO):
- `dailyTopUpAmount` (Long) - Today's total top-up amount
- `dailyTransferAmount` (Long) - Today's total transfer amount
- `dailyLimitIncrease` (Long) - Today's limit increase from lottery
- `lastLotteryPlayTime` (LocalDateTime) - Last time user played lottery
- `lastUpdated` (LocalDateTime) - Last stats update time

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 2.2 Get User Transfers
**Endpoint**: `GET /api/users/{chatId}/transfers`

**Purpose**: Get user's transfer history with pagination and filters

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Query Parameters**:
- `page` (int, default: 0) - Page number
- `size` (int, default: 20, max: 100) - Page size
- `status` (RequestStatus, optional) - Filter by status (PENDING, APPROVED, CANCELED, FAILED, etc.)
- `platform` (String, optional) - Filter by platform name
- `type` (RequestType, optional) - Filter by type (TOP_UP, WITHDRAWAL)
- `startDate` (LocalDateTime, optional) - Start date for date range (ISO format)
- `endDate` (LocalDateTime, optional) - End date for date range (ISO format)

**Example Request**:
```
GET /api/users/123456789/transfers?page=0&size=20&status=APPROVED&type=TOP_UP&startDate=2024-01-01T00:00:00&endDate=2024-01-31T23:59:59
```

**Response**: `Page<HizmatRequest>`
```json
{
  "content": [
    {
      "id": 1,
      "chatId": 123456789,
      "platform": "Mostbet",
      "currency": "UZS",
      "platformUserId": "user123",
      "fullName": "John Doe",
      "cardNumber": "1234567890123456",
      "amount": 100000,
      "paymentAttempts": 1,
      "uniqueAmount": 100050,
      "adminCardId": 1,
      "status": "APPROVED",
      "type": "TOP_UP",
      "createdAt": "2024-01-15T10:30:00",
      "transactionId": "txn-123",
      "billId": null,
      "payUrl": null
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false,
      "property": "createdAt",
      "direction": "DESC"
    }
  },
  "totalElements": 45,
  "totalPages": 3
}
```

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 2.3 Get User Summary
**Endpoint**: `GET /api/users/{chatId}/summary`

**Purpose**: Get user activity summary with aggregated statistics

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Example Request**:
```
GET /api/users/123456789/summary
```

**Response**: `UserSummaryDTO`
```json
{
  "totalTopUps": 5000000,
  "totalTransfers": 3000000,
  "totalRequests": 150,
  "approvedRequests": 120,
  "canceledRequests": 15,
  "pendingRequests": 10,
  "failedRequests": 5,
  "firstRequestDate": "2024-01-15T10:30:00",
  "lastRequestDate": "2024-01-20T15:00:00"
}
```

**UserSummaryDTO Fields**:
- `totalTopUps` (Long) - Total approved top-up amount
- `totalTransfers` (Long) - Total approved transfer amount
- `totalRequests` (Long) - Total number of requests
- `approvedRequests` (Long) - Number of approved requests
- `canceledRequests` (Long) - Number of canceled requests
- `pendingRequests` (Long) - Number of pending requests
- `failedRequests` (Long) - Number of failed requests
- `firstRequestDate` (LocalDateTime) - Date of first request
- `lastRequestDate` (LocalDateTime) - Date of last request

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 2.4 Update User Balance
**Endpoint**: `PUT /api/users/{chatId}/balance`

**Purpose**: Update user's bonus balance

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Request Body**:
```json
{
  "balance": 100000.00
}
```

**Response**: Updated `UserBalance` object
```json
{
  "chatId": 123456789,
  "tickets": 10,
  "balance": 100000.00,
  "lastLotteryPlayTime": "2024-01-20T14:30:00"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid balance (must be >= 0)
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 2.5 Update User Tickets
**Endpoint**: `PUT /api/users/{chatId}/tickets`

**Purpose**: Update user's lottery tickets

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Request Body**:
```json
{
  "tickets": 50
}
```

**Response**: Updated `UserBalance` object
```json
{
  "chatId": 123456789,
  "tickets": 50,
  "balance": 100000.00,
  "lastLotteryPlayTime": "2024-01-20T14:30:00"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid tickets (must be >= 0)
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 2.6 Update User Limit
**Endpoint**: `PUT /api/users/{chatId}/limit`

**Purpose**: Update user's permanent limit increase

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Request Body**:
```json
{
  "permanentLimitIncrease": 50000
}
```

**Response**: Updated `UserLimitIncrease` object
```json
{
  "chatId": 123456789,
  "accumulatedLimitIncrease": 50000,
  "lastUpdated": "2024-01-20T16:00:00"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid limit (must be >= 0)
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 2.7 Block User
**Endpoint**: `POST /api/users/{chatId}/block`

**Purpose**: Block a user (prevents them from using the bot)

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Example Request**:
```
POST /api/users/123456789/block
```

**Response**: Success message
```json
"User blocked successfully: 123456789"
```

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `409 Conflict` - User is already blocked
- `500 Internal Server Error` - Server error

---

### 2.8 Unblock User
**Endpoint**: `POST /api/users/{chatId}/unblock`

**Purpose**: Unblock a user

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Example Request**:
```
POST /api/users/123456789/unblock
```

**Response**: Success message
```json
"User unblocked successfully: 123456789"
```

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `409 Conflict` - User is not blocked
- `500 Internal Server Error` - Server error

---

### 2.9 Delete User
**Endpoint**: `DELETE /api/users/{chatId}`

**Purpose**: Delete user data (soft delete by default, hard delete optional)

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Query Parameters**:
- `deleteType` (String, optional, default: "soft") - Delete type: "soft" or "hard"

**Soft Delete** (default):
- Sets balance to 0
- Sets tickets to 0
- Blocks the user
- Keeps all transaction history

**Hard Delete**:
- Deletes User record
- Deletes UserBalance record
- Deletes BlockedUser record
- Deletes UserLimitIncrease record
- Deletes DailyUserStats records
- **Warning**: This is permanent and cannot be undone!

**Example Request**:
```
DELETE /api/users/123456789?deleteType=soft
```

**Response**: Success message
```json
"User deleted successfully (type: soft): 123456789"
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid deleteType
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 2.10 Update User Language
**Endpoint**: `PUT /api/users/{chatId}/language`

**Purpose**: Update user's language preference

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Request Body**:
```json
{
  "language": "UZ"
}
```

**Valid Values**: "UZ" or "RU"

**Response**: Updated `User` object
```json
{
  "chatId": 123456789,
  "language": "UZ"
}
```

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid language (must be UZ or RU)
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

### 2.11 Reset Daily Stats
**Endpoint**: `POST /api/users/{chatId}/reset-daily-stats`

**Purpose**: Reset user's daily statistics for today

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Example Request**:
```
POST /api/users/123456789/reset-daily-stats
```

**Response**: Success message
```json
"Daily stats reset successfully for user: 123456789"
```

**What it resets**:
- `dailyTopUpAmount` → 0
- `dailyTransferAmount` → 0
- `dailyLimitIncrease` → 0

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 2.12 Reset Balance
**Endpoint**: `POST /api/users/{chatId}/reset-balance`

**Purpose**: Reset user's balance and tickets to zero

**Path Parameters**:
- `chatId` (Long, required) - User's chat ID

**Example Request**:
```
POST /api/users/123456789/reset-balance
```

**Response**: Success message
```json
"Balance and tickets reset successfully for user: 123456789"
```

**What it resets**:
- `balance` → 0
- `tickets` → 0

**Status Codes**:
- `200 OK` - Success
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

## Request/Response Types

### RequestStatus Enum
- `PENDING`
- `PENDING_SMS`
- `PENDING_ADMIN`
- `APPROVED`
- `BONUS_APPROVED`
- `CANCELED`
- `PENDING_PAYMENT`
- `FAILED`
- `PENDING_SCREENSHOT`

### RequestType Enum
- `TOP_UP`
- `WITHDRAWAL`

### Language Enum
- `UZ` - Uzbek
- `RU` - Russian

---

## Error Responses

All endpoints return error messages in the response body:

**401 Unauthorized**:
```json
"Unauthorized"
```

**400 Bad Request**:
```json
"Balance must be non-negative"
```

**404 Not Found**:
```json
"User not found with chatId: 123456789"
```

**409 Conflict**:
```json
"User is already blocked"
```

**500 Internal Server Error**:
```json
"Error updating balance: [error message]"
```

---

## Notes

1. **Pagination**: Default page size is 20, maximum is 100
2. **Date Format**: Use ISO 8601 format for dates: `2024-01-20T15:30:00`
3. **Balance/Tickets**: Must be non-negative numbers
4. **Blocking**: Blocked users have `phoneNumber = "BLOCKED"` in BlockedUser table
5. **Soft Delete**: Recommended for audit purposes, keeps transaction history
6. **Hard Delete**: Permanent deletion, use with caution
7. **Bulk Operations**: May have partial success - check response for actual count
