const { networkInterfaces } = require('os');

function getLocalIP() {
  if (process.env.HOST_IP) return process.env.HOST_IP;

  const nets = networkInterfaces();
  // Prefer Wi-Fi/Ethernet over VPN and virtual interfaces
  const names = Object.keys(nets).sort((a, b) => /^(en|eth|wlan)/.test(b) - /^(en|eth|wlan)/.test(a));

  for (const name of names) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

module.exports = { getLocalIP };