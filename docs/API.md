# Godavari GeoSeva 2027 - RESTful API Specification

Base URL: `/api/v1`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Registers a new user (Pilgrim or Field Volunteer). Public registration strictly prevents self-assigning the `ADMIN` role.
- **Request Body:**
  ```json
  {
    "name": "Bhavani Shankar",
    "email": "volunteer@example.com",
    "password": "SecurePassword123",
    "role": "VOLUNTEER", // "PILGRIM" | "VOLUNTEER"
    "phone": "+91 9848011223",
    "organization": "Pushkaralu Seva Corps"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "66d1234...",
        "name": "Bhavani Shankar",
        "email": "volunteer@example.com",
        "role": "VOLUNTEER"
      }
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates a user and sets an HttpOnly JWT cookie while also returning the token in the JSON body for flexible client integration.
- **Request Body:**
  ```json
  {
    "email": "admin@godavariseva.gov.in",
    "password": "Admin@2027"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "66d012...",
        "name": "Srikar Varma (Administrator)",
        "email": "admin@godavariseva.gov.in",
        "role": "ADMIN"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### `GET /api/v1/auth/me`
Retrieves the profile of the currently authenticated user.

### `POST /api/v1/auth/logout`
Clears the session cookie and invalidates client credentials.

---

## 2. Facilities Endpoints

### `GET /api/v1/facilities`
Retrieves facilities matching filter query criteria.
- **Query Parameters:**
  - `category`: `GHAT`, `TOILET`, `DRINKING_WATER`, `MEDICAL`, `SHELTER`, `EMERGENCY`, `ROAD_ACCESS`, `OTHER`
  - `operationalStatus`: `OPEN`, `CLOSED`, `TEMPORARILY_UNAVAILABLE`, `UNKNOWN`
  - `verificationStatus`: `VERIFIED`, `PENDING_VERIFICATION`, `UNVERIFIED`, `REJECTED`
  - `search`: Keyword string matching facility name, description, or address
  - `page`: Page index (default: 1)
  - `limit`: Number of items per page (default: 20, max: 100)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "facilities": [...],
      "pagination": { "total": 35, "page": 1, "pages": 2 }
    }
  }
  ```

### `GET /api/v1/facilities/nearby`
Finds facilities within a radius of a given geographic coordinate using MongoDB `$near` with a `2dsphere` index.
- **Query Parameters:**
  - `latitude`: Number (-90 to 90)
  - `longitude`: Number (-180 to 180)
  - `radius`: Distance radius in meters (default: 5000)
  - `category`: Optional category filter
- **Response `200 OK`:** Returns facilities sorted ascending by spherical distance, with `distanceMeters` calculated.

### `GET /api/v1/facilities/:id`
Retrieves the complete geospatial specification for a single facility.

### `POST /api/v1/facilities`
Creates a new facility record. Requires `ADMIN` or `VOLUNTEER` authorization.

### `PATCH /api/v1/facilities/:id`
Updates operational status, ground verification details, or coordinates. Requires `ADMIN` or `VOLUNTEER`.

### `DELETE /api/v1/facilities/:id`
Soft-deactivates or permanently removes an incorrect facility record. Requires `ADMIN`.

---

## 3. Civic Issues Endpoints

### `POST /api/v1/issues`
Submits a civic issue report. Supports multipart form data for photograph upload.
- **Payload:**
  - `category`: `DAMAGED_TOILET`, `WATER_UNAVAILABLE`, `MEDICAL_ACCESS_PROBLEM`, etc.
  - `title`: Short title
  - `description`: Detailed description
  - `latitude`: WGS84 latitude
  - `longitude`: WGS84 longitude
  - `photo`: Optional image binary (JPEG/PNG/WebP, max 5MB)

### `GET /api/v1/issues`
Retrieves submitted reports with filter parameters (`status`, `category`, `page`, `limit`).

### `PATCH /api/v1/issues/:id/status`
Updates status (`SUBMITTED`, `UNDER_REVIEW`, `VERIFIED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`) and records an administrative note with an audit trail.

---

## 4. Authority Dashboard & Spatial Analytics

### `GET /api/v1/dashboard/summary`
Calculates real-time aggregation metrics from MongoDB:
- Total mapped facilities
- Verified vs unverified
- Stale/unknown operational status
- Total civic issues (open, under review, resolved)

### `GET /api/v1/dashboard/facility-statistics`
Aggregates facilities grouped by civic category.

### `GET /api/v1/dashboard/issue-statistics`
Aggregates civic complaints grouped by current resolution status.

### `GET /api/v1/dashboard/coverage-analysis`
Computes grid-based spatial coverage across the Rajamahendravaram-Kovvur river corridor. Identifies potential coverage gaps based on:
1. Bathing ghats without immediately mapped drinking water or sanitation.
2. Sectors where distance to nearest emergency medical post exceeds 1.5 km.
3. Issue clusters where unresolved reports >= 2.
