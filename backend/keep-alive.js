// keep-alive.js
// This script pings the server root endpoint periodically to prevent Render from idling the service.

const http = require('http');

const SERVER_URL = process.env.KEEP_ALIVE_URL || 'http://localhost:3000/'; // Change port if needed
const INTERVAL = 5 * 60 * 1000; // 5 minutes

function pingServer() {
  http.get(SERVER_URL, (res) => {
    console.log(`[KeepAlive] Pinged ${SERVER_URL} - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[KeepAlive] Error pinging ${SERVER_URL}:`, err.message);
  });
}

setInterval(pingServer, INTERVAL);
console.log(`[KeepAlive] Started. Pinging ${SERVER_URL} every ${INTERVAL / 60000} minutes.`);

// Initial ping
pingServer();
