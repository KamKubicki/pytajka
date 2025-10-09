const http = require('http');
const app = require('./app');
const initializeSocket = require('./socket');
const routes = require('./routes');
const { getLocalIP } = require('./utils');

const server = http.createServer(app);
initializeSocket(server);

app.use('/api', routes);

const PORT = process.env.PORT || 8001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${getLocalIP()}:${PORT}`);
  console.log(`📱 For selfie on iPhone: use Chrome instead of Safari`);
});