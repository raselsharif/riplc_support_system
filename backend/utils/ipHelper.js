const os = require("os");

const normalizeIp = (ip) => {
  if (!ip) return null;
  const trimmed = ip.trim();
  return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
};

const getClientIp = (req) => {
  // 1) X-Forwarded-For
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const first = xff.split(",")[0];
    const ip = normalizeIp(first);
    if (ip) return ip;
  }

  // 2) Express-calculated
  const fromReq = normalizeIp(req.ip);
  if (fromReq) return fromReq;

  // 3) Socket fallback
  const fromSocket = normalizeIp(req.socket?.remoteAddress);
  if (fromSocket) return fromSocket;

  return "unknown";
};

const getServerLocalIP = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "unknown";
};

module.exports = { getClientIp, getServerLocalIP, normalizeIp };
