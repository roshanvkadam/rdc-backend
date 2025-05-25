# 🌐 Backend Server Documentation

This document explains how the backend server works, its endpoints, WebSocket communication, and internal logic. It complements the agent script by providing an interface to manage and control connected clients.

---

## 🧾 Overview

The server is built using **Express.js** and **ws (WebSocket)**. It:

* Handles WebSocket connections from agent clients.
* Receives periodic system updates.
* Sends shutdown commands to individual or all connected clients.
* Provides authenticated REST API endpoints.
* Maintains client status in memory and via a DB abstraction (`db.js`).

---

## 🏗️ File Structure

```
server.js           # Main backend script
middleware.js       # Auth middleware
./db/index.js       # Data abstraction for storing clients
```

---

## 🚀 Starting the Server

Install dependencies:

```bash
npm install express ws cors
```

Start the server:

```bash
node app.js
```

The server runs on:

```
http://0.0.0.0:5000
```

---

## 🔒 Middleware (Authentication)

All endpoints under the following paths are protected by `authMiddleware`:

* `/computers`
* `/shutdown/:computerName`
* `/shutdown-all`
* `/remove/:computerName`

You should implement and export authentication logic inside `middleware.js`.

---

## 🔄 WebSocket Server (`ws`)

WebSocket server listens for incoming connections from agent clients. When a client connects:

* It sends a JSON payload with system info.
* This info is used to register or update the client.
* The client is stored in a local `clients` object.

### 📥 Incoming Messages Format (from agent)

```json
{
  "computer_name": "DESKTOP-1234",
  "ip": "192.168.0.2",
  "start_time": 1716555700000,
  "up_time": "2h 30m",
  "uptime_seconds": 9000,
  "lastSeen": 1716556600000,
  "status": "online"
}
```

### ❌ Disconnect Handling

When a WebSocket disconnects, the corresponding client:

* Is removed from the `clients` object.
* Is marked as offline in the DB via `updateClientStatus()`.

---

## 📡 REST API Endpoints

All routes require valid authentication via `authMiddleware`.

### `GET /computers`

Returns a list of all clients stored in memory or database.

**Response:**

```json
[
  {
    "computer_name": "DESKTOP-1234",
    "status": "online",
    ...
  },
  ...
]
```

---

### `POST /shutdown/:computerName`

Sends a shutdown command to the specified client.

**Request Params:**

* `:computerName` — the name of the computer to shut down

**Response (Success):**

```json
{ "message": "Shutdown sent to DESKTOP-1234" }
```

**Response (Failure):**

```json
{ "message": "Computer not connected" }
```

---

### `POST /shutdown-all`

Sends a shutdown command to all currently connected clients.

**Response:**

```json
{ "message": "Shutdown command sent to ALL clients." }
```

---

### `DELETE /remove/:computerName`

Removes a client entry from the database or memory.

**Request Params:**

* `:computerName` — the name of the computer to delete

**Response (Success):**

```json
{ "message": "Computer DESKTOP-1234 removed successfully" }
```

**Response (Failure):**

```json
{ "error": "Computer DESKTOP-1234 not found" }
```

---

## 🗃️ DB Layer (Expected Functions)

You should implement the following functions in your `db.js` file:

```js
function updateClient(data) {}
function updateClientStatus(name, data) {}
function getClients() {}
function removeClient(name) {}
```

These handle:

* Updating client info and status
* Retrieving client lists
* Removing clients by name

---

## ✅ Summary

This server provides the control and monitoring center for all connected agents. With real-time WebSocket communication and REST API control, it supports managing remote machines effectively.

Make sure the agent clients and server are synchronized on:

* WebSocket URL
* Authentication (for REST endpoints)
* Computer name format for consistency
