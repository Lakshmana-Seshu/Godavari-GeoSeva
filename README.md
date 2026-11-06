# Godavari GeoSeva 2027
### GIS-Based Mapping of Facilities and Civic Infrastructure for Godavari Pushkaralu 2027

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![MongoDB 2dsphere](https://img.shields.io/badge/MongoDB-GeoJSON%202dsphere-green)](https://www.mongodb.com/)
[![Leaflet GIS](https://img.shields.io/badge/Leaflet-OpenStreetMap-orange)](https://leafletjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-teal)](https://tailwindcss.com/)

---

## 1. Project Overview & Problem Statement

**Godavari GeoSeva 2027** is an up-to-date geospatial mapping platform built for the **Godavari Pushkaralu 2027** festival along the Rajamahendravaram - Kovvur river corridor.

During the 12-day festival, tens of millions of pilgrims converge on the banks of the Godavari River. Locating essential facilities—such as sacred bathing ghats, clean drinking water kiosks, public bio-toilets, emergency trauma centers, and temporary shelters—presents a major crowd safety challenge. Simultaneously, municipal authorities require live spatial intelligence to verify facilities, track crowdsourced civic complaints, and identify infrastructure coverage gaps in real time.

---

## 2. Key Features

- **Interactive GIS Map (Leaflet & OpenStreetMap):**
  - Distinct markers with custom vector icons for each facility category.
  - Category filtering (Ghats, Toilets, Water, Medical, Shelters, Emergency, Access Routes).
  - Geolocation proximity query with configurable search radius (500m to 5km).
  - OpenStreetMap-based pedestrian walking route navigation.
  - Marker clustering and transparent verification badges.

- **Crowdsourced Civic Grievance Reporting:**
  - Submit reports for damaged toilets, dry drinking water taps, or blocked corridors.
  - Map coordinate picker and GPS capture with user permission.
  - Optional photo upload with size and type validation.
  - Trackable unique reference ID for status lookup.

- **Authority Command & Operations Dashboard:**
  - Real-time aggregations calculated from MongoDB (not fabricated static mockups).
  - Recharts visual distribution charts for facility categories and grievance statuses.
  - Full facility inventory management (create, update, ground-verify, and deactivate records).
  - Issue grievance review queue with audit logs and status updates.

- **GIS Spatial Corridor Gap Analysis:**
  - Algorithmic grid cell analysis across the Rajamahendravaram-Kovvur corridor.
  - Transparent gap indicators (ghats without nearby drinking water, nearest medical post > 1.5km, issue clusters >= 2).
  - Sector-by-sector spatial audit table.

- **Offline-Friendly Enhancement:**
  - Service worker application shell caching.
  - Offline local caching of previously retrieved facility records with visible timestamp.
  - Clear offline indicator with status notice.

- **Enterprise Security:**
  - Bcrypt password hashing and JWT token authentication.
  - Role-based access control (`PILGRIM`, `VOLUNTEER`, `ADMIN`).
  - Strict input validation with Zod.
  - Helmet security headers and CORS protection.
  - Rate limiting on authentication and civic reporting endpoints.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, React Router DOM, Tailwind CSS, Google Maps Platform (`@vis.gl/react-google-maps`), Leaflet & React Leaflet, Axios, Recharts, Lucide React, React Hook Form.
- **Backend:** Node.js, Express.js, MongoDB with Mongoose, JWT, bcryptjs, Zod validation, Multer, Helmet, CORS, express-rate-limit.
- **Geospatial Engine:** Google Maps JavaScript API, MongoDB 2dsphere indexes, GeoJSON (EPSG:4326), and Haversine great-circle formula.

---

## 4. System Architecture & Directory Structure

```
godavari-geoseva-2027/
|-- client/                     # React + Vite Frontend
|   |-- public/                 # Static assets, sw.js, manifest.json
|   |-- src/
|   |   |-- api/                # Axios API service clients
|   |   |-- components/
|   |   |   |-- common/         # Navbar, Footer, Badges, OfflineBanner
|   |   |   |-- map/            # InteractiveMap, MapLegend, MapController
|   |   |   |-- facilities/     # FacilityCard, FacilityFilter, Modals
|   |   |   |-- issues/         # IssueCard, IssueStatusModal
|   |   |   |-- dashboard/      # MetricCard, CategoryChart, IssueStatusChart
|   |   |-- context/            # AuthContext, OfflineContext
|   |   |-- hooks/              # useGeolocation, useOnlineStatus
|   |   |-- layouts/            # MainLayout, AdminLayout
|   |   |-- pages/              # Home, ExploreMap, Facilities, ReportIssue, etc.
|   |   |-- routes/             # AppRoutes (Public & Protected)
|   |   |-- utils/              # formatters, mapIcons, storage
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- index.css
|   |-- package.json
|   |-- vite.config.js
|   |-- tailwind.config.js
|
|-- server/                     # Express.js REST API
|   |-- src/
|   |   |-- config/             # Database connection, constants
|   |   |-- controllers/        # auth, facility, issue, dashboard, user
|   |   |-- middleware/         # auth, role, validate, rateLimiter, upload
|   |   |-- models/             # User, Facility, CivicIssue, AuditLog
|   |   |-- routes/             # auth, facility, issue, dashboard, user
|   |   |-- services/           # geoSpatialService, auditService
|   |   |-- validators/         # auth, facility, issue Zod schemas
|   |   |-- app.js
|   |   |-- server.js
|   |-- scripts/
|   |   |-- seed.js             # Synthetic demonstration dataset seeder
|   |   |-- test-api.js         # Backend integration test suite
|   |-- package.json
|
|-- docs/                       # Technical Documentation
|   |-- API.md
|   |-- DATABASE.md
|   |-- DEPLOYMENT.md
|
|-- package.json                # Root workspace scripts
|-- README.md
|-- .env.example
```

---

## 5. Local Setup & Installation (Windows)

### Prerequisites
- Node.js (v18.0.0 or later)
- MongoDB Community Server (v6.0 or later) installed locally or a MongoDB Atlas connection string.

### Step 1: Clone & Install Dependencies
From the project root:
```powershell
npm run install:all
```
Or individually:
```powershell
cd server && npm install
cd ../client && npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file inside `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/godavari_geoseva_2027
JWT_SECRET=godavari_pushkaralu_2027_secure_jwt_token_development
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
ADMIN_SETUP_SECRET=pushkaralu_admin_seed_secure_token_2027
```

### Step 3: Seed the Demonstration Database
Start MongoDB and run the seed script:
```powershell
npm run seed
```
This initializes the database with verified bathing ghats, drinking water points, medical camps, shelters, and civic grievances along the Rajamahendravaram corridor.

**Default Demonstration Credentials:**
- **Administrator:** `admin@godavariseva.gov.in` / `Admin@2027`
- **Field Volunteer:** `volunteer@godavariseva.gov.in` / `Volunteer@2027`
- **Pilgrim Citizen:** `pilgrim@example.com` / `Pilgrim@2027`

### Step 4: Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```powershell
npm run server
# Server listening on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```powershell
npm run client
# Client running on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 6. Testing

Run the automated backend integration test suite:
```powershell
npm test
```
The test suite validates password hashing, JWT expiration, privilege escalation defense, Haversine spherical distance accuracy, GeoJSON coordinate limits, and civic issue status state machines.

---

## 7. Known Limitations & Future Improvements

- **Road Network Routing:** The current version provides direct routing links to OpenStreetMap walking directions. Future iterations will integrate a local Valhalla or GraphHopper routing engine for pedestrian footpath constraints.
- **Ground Truth Validation:** Synthetic demonstration records are clearly flagged with `dataSource: "SYNTHETIC_DEMO"` and require nodal authority on-site verification before production deployment.
- **Multi-language Support:** Telugu and Hindi localization can be integrated for enhanced accessibility to all pilgrims.
