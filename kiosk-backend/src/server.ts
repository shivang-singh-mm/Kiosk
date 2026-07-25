import http from 'http';
import { app, PORT } from './app';
import { initSocket } from './core/socket';
import { registerSocketEvents } from './modules/websocket/events';
import { seedDatabase } from './seed';

import galleryRouter from './modules/gallery/router';
import videoRouter from './modules/video/router';
import inventoryRouter from './modules/inventory/router';
import bookingRouter from './modules/booking/router';

const server = http.createServer(app);

// Initialize Socket.IO server
initSocket(server);
registerSocketEvents();

// Mount REST API Routers under /api prefix
app.use('/api', galleryRouter);
app.use('/api', videoRouter);
app.use('/api', inventoryRouter);
app.use('/api', bookingRouter);

async function startServer() {
  try {
    // Seed and verify PostgreSQL connection
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Node.js + Express + PostgreSQL Kiosk Backend Running`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`⚡ WebSocket Server: http://localhost:${PORT}/socket.io`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
