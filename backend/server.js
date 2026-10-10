const http = require('http');
const app = require('./app');
const initializeSocket = require('./socket');
const routes = require('./routes');
const { getLocalIP } = require('./utils');

app.use('/api', routes);

const server = http.createServer(app);
initializeSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${getLocalIP()}:${PORT}`);
  console.log(`📱 For selfie on iPhone: use Chrome instead of Safari`);
});

// 🛡️ Don't let a single bad timer/handler kill the server mid-party
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});