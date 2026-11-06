# Godavari GeoSeva 2027 - Database Architecture

The platform uses **MongoDB** exclusively with GeoJSON Point structures and `2dsphere` indexes.

---

## 1. GeoJSON Point Structure

Geographic positions are stored according to the official GeoJSON (RFC 7946) standard:

```json
{
  "location": {
    "type": "Point",
    "coordinates": [81.7760, 17.0010] // [longitude, latitude]
  }
}
```

> **CRITICAL RULE:** In GeoJSON, longitude comes first (`coordinates[0]`), and latitude comes second (`coordinates[1]`).

---

## 2. Collections & Schemas

### A. Facilities (`facilities`)
Represents mapped civic assets (ghats, toilets, medical posts, water kiosks, shelters):
- `name` (String, indexed for text search)
- `category` (Enum: `GHAT`, `TOILET`, `DRINKING_WATER`, `MEDICAL`, `SHELTER`, `EMERGENCY`, `ROAD_ACCESS`, `OTHER`)
- `description` (String)
- `location` (GeoJSON Point with `2dsphere` index)
- `address` (String)
- `landmark` (String)
- `operationalStatus` (Enum: `OPEN`, `CLOSED`, `TEMPORARILY_UNAVAILABLE`, `UNKNOWN`)
- `verificationStatus` (Enum: `UNVERIFIED`, `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`)
- `accessibility` (Subdocument: wheelchair ramp, braille, elderly assistance)
- `openingHours` (Subdocument: 24hrs flag, openTime, closeTime)
- `contactInformation` (Subdocument: phone, inChargeName, emergencyHelpline)
- `capacity` (Subdocument: estimatedCapacity, unit)
- `dataSource` (String: `OFFICIAL_MUNICIPAL`, `FIELD_SURVEY`, `CROWDSOURCED`, `SYNTHETIC_DEMO`)
- `lastVerifiedAt` (Date)
- `isActive` (Boolean, default: true)
- `photographs` (Array of Strings)
- `createdBy` / `updatedBy` (ObjectId ref User)
- `timestamps` (`createdAt`, `updatedAt`)

### B. Civic Issues (`civicissues`)
Represents citizen and volunteer reports of damaged or unavailable infrastructure:
- `title` (String)
- `description` (String)
- `category` (Enum: `DAMAGED_TOILET`, `WATER_UNAVAILABLE`, `MEDICAL_ACCESS_PROBLEM`, `INCORRECT_FACILITY_LOCATION`, `BLOCKED_PEDESTRIAN_ROUTE`, `DAMAGED_INFRASTRUCTURE`, `MISSING_FACILITY`, `OTHER`)
- `location` (GeoJSON Point with `2dsphere` index)
- `address` (String)
- `status` (Enum: `SUBMITTED`, `UNDER_REVIEW`, `VERIFIED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`)
- `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `statusHistory` (Array of subdocuments: status, updatedBy, note, timestamp)
- `administrativeNotes` (String)
- `attachments` (Array of Strings)
- `submittedBy` (ObjectId ref User, optional)
- `timestamps` (`createdAt`, `updatedAt`)

### C. Users (`users`)
- `name` (String)
- `email` (String, unique, indexed)
- `passwordHash` (String, bcrypt hashed)
- `role` (Enum: `PILGRIM`, `VOLUNTEER`, `ADMIN`)
- `organization` (String)
- `phone` (String)
- `accountStatus` (Enum: `ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`)
- `timestamps` (`createdAt`, `updatedAt`)

### D. Audit Log (`auditlogs`)
- `actor` (ObjectId ref User)
- `actorName` (String)
- `actorRole` (String)
- `action` (String)
- `resourceType` (String)
- `resourceId` (String)
- `changeSummary` (String)
- `details` (Mixed)
- `ipAddress` (String)
- `userAgent` (String)
- `timestamp` (Date)

---

## 3. Database Indexes

```javascript
// Spatial Query Performance
db.facilities.createIndex({ location: "2dsphere" });
db.civicissues.createIndex({ location: "2dsphere" });

// High-speed Filtering
db.facilities.createIndex({ category: 1, verificationStatus: 1, operationalStatus: 1 });
db.facilities.createIndex({ isActive: 1, category: 1 });
db.facilities.createIndex({ name: "text", address: "text", description: "text" });

db.civicissues.createIndex({ status: 1, category: 1 });
db.users.createIndex({ email: 1 }, { unique: true });
```
