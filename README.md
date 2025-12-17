# Shorta - URL Shortener

A full-stack URL shortener application built with React and Node.js/Express.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB 
- npm or yarn

## Getting Started

### 1. Start MongoDB

Make sure MongoDB is running on your system. If using MongoDB Atlas, update the connection string in `server/.env`.

### 2. Backend Setup

The dependencies are already installed. To start the server:

```bash
cd server
npm start
```

The server will run on `http://localhost:5000` (or the PORT specified in `.env`).

**Note:** The `.env` file is already configured with:
```
MONGO_URI=mongodb://localhost:27017/shorta
PORT=5000
```


### 3. Frontend Setup

The dependencies are already installed. To start the React app:

```bash
cd client
npm start
```

The frontend will open at `http://localhost:3000` and automatically connect to the backend API.

## API Endpoints

- `POST /api/shorten` - Create a shortened URL
  - Body: `{ "longUrl": "https://example.com" }`
  - Returns: URL object with `longUrl`, `shortCode`, and `_id`

- `GET /api/links` - Get all shortened links
  - Returns: Array of all URL objects

- `GET /:shortCode` - Redirect to original URL
  - Example: `http://localhost:5000/abc123` redirects to the original URL

## Features

- Shorten long URLs with unique 6-character codes
- View list of all shortened links
- Copy short URLs to clipboard
- Automatic redirect to original URLs
- Modern, responsive UI
- Error handling and validation

## Development

- Backend uses Express.js with MongoDB/Mongoose
- Frontend uses React with Axios for API calls
- CORS is enabled for development
- Environment variables are managed with dotenv

