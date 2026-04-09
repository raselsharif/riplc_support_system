const roleMiddleware = (...roles) => {
  const allowed = roles.flat().map((r) => (r || '').toString().trim().toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. No user context.' });
    }

    const userRole = (req.user.role || '').toString().trim().toLowerCase();

    // If no roles specified, allow
    if (!allowed.length) {
      return next();
    }

    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }

    next();
  };
};

module.exports = roleMiddleware;
