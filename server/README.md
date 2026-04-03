# 🌿 Dr. Planteinstein — Backend Server

An industry-standard **Express.js + MongoDB** REST API for the Dr. Planteinstein plant disease detection mobile app.

## 📂 Folder Structure

```
server/
├── index.js                    # Entry point — connects DB, starts server
├── .env                        # Environment variables (not committed)
├── uploads/                    # Dynamically stores uploaded leaf images
└── src/
    ├── app.js                  # Express app — middleware + routes wired up
    ├── config/
    │   ├── database.js         # MongoDB connection via Mongoose
    │   └── multer.js           # Multer image upload config (10MB, jpg/png/webp)
    ├── controllers/
    │   ├── analyzeController.js   # POST /api/analyze handler
    │   └── recordsController.js   # GET/DELETE /api/records handlers
    ├── middleware/
    │   └── errorHandler.js     # Global Express error handler
    ├── models/
    │   └── Record.js           # Mongoose schema for scan records
    ├── routes/
    │   ├── analyzeRoutes.js    # /api/analyze endpoint
    │   └── recordsRoutes.js    # /api/records endpoints
    └── services/
        └── analysisService.js  # Mock AI disease engine (replace with real ML API)
```

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Edit `.env`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/plantenstein
NODE_ENV=development
```
> For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 4. Run in Development
```bash
npm run dev
```

### 5. Run in Production
```bash
npm start
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/analyze` | Upload a leaf image for AI analysis |
| `GET` | `/api/records` | Get all scan records (filterable + paginated) |
| `GET` | `/api/records/:id` | Get a single scan record |
| `DELETE` | `/api/records/:id` | Delete a scan record |

### POST `/api/analyze`
**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | ✅ | Leaf image (jpg/png/webp, max 10MB) |
| `latitude` | String | ❌ | GPS latitude |
| `longitude` | String | ❌ | GPS longitude |
| `address` | String | ❌ | Human-readable location |

### GET `/api/records`
**Query Params:**
| Param | Example | Description |
|-------|---------|-------------|
| `status` | `?status=critical` | Filter by severity |
| `page` | `?page=2` | Page number |
| `limit` | `?limit=10` | Results per page |

## 🔗 Connecting the React Native App

The app uses `src/services/api.ts`. Update `BASE_URL` with your server's **local IP address** when testing on a physical device:

```ts
// src/services/api.ts
const BASE_URL = "http://192.168.1.xx:3000/api"; // 👈 Your machine's IP
```

Find your IP by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

## 🤖 Production AI Integration

Replace `src/services/analysisService.js` with a real model:
- **[Plant.id API](https://plant.id)** — REST API for plant disease identification
- **Google Vertex AI** — Custom AutoML Vision model
- **TensorFlow.js** — On-device inference

