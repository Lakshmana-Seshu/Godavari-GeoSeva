# Deployment Guide - Godavari GeoSeva 2027

This document describes how to deploy the client and server components to production environments (e.g. Render, Railway, AWS EC2, or Vercel).

---

## 1. Architecture Overview

- **Frontend Client:** React SPA built with Vite, styled with Tailwind CSS, mapped with Leaflet and React Leaflet.
- **Backend Server:** Express.js REST API with Helmet, CORS, Rate Limiting, Mongoose, and Multer for uploads.
- **Database:** MongoDB (Local or MongoDB Atlas) with `2dsphere` geospatial indexing.

---

## 2. Server Deployment

### Prerequisites
- Node.js 18+ or 20+
- MongoDB 6.0+ or MongoDB Atlas Cluster

### Environment Variables
Configure the following in your hosting provider's dashboard:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/godavari_geoseva_2027?retryWrites=true&w=majority
JWT_SECRET=production_ultra_secure_jwt_secret_pushkaralu_2027
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://geoseva.pushkaralu.gov.in
ADMIN_SETUP_SECRET=official_nodal_admin_secret_token_2027
```

### Build & Run Commands
```bash
# In the server directory:
npm install --production=false
npm run seed     # Run once safely to initialize collections & indexes
npm start        # Starts the production server via node src/server.js
```

---

## 3. Client Deployment

### Environment Variables
```env
VITE_API_BASE_URL=https://api.geoseva.pushkaralu.gov.in/api/v1
```

### Build Commands
```bash
# In the client directory:
npm install
npm run build
```

The output in `client/dist` can be hosted statically on Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.

---

## 4. HTTPS & Security Checklist

1. **Strict CORS Policy:** Ensure `CLIENT_ORIGIN` matches the exact deployed frontend domain.
2. **HttpOnly Cookies:** Ensure cookies have `secure: true` and `sameSite: 'lax'` or `'none'` (with HTTPS enabled).
3. **Database Security:** Restrict MongoDB Atlas IP whitelist to the backend server's static IP.
4. **Service Worker:** Served over HTTPS to enable offline caching for pilgrims in high-density crowd conditions.
