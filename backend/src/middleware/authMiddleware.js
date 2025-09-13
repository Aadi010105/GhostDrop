const jwt = require('jsonwebtoken');

const authMiddleware = (allowedRoles = []) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = payload; // { userId, role }

    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden: Role not allowed' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthenticated' });
  }
};

module.exports = authMiddleware;
