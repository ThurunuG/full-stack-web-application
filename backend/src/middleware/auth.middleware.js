const { verifyAccessToken } = require('../config/jwt');

// Authenticate requests using the access token from the Authorization header.
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  // Reject requests that do not use the expected Bearer token format.
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and attach its decoded payload to the request.
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    // Return a distinct response when the token is valid but has expired.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please refresh your session.',
        isExpired: true,
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid access token.',
    });
  }
};

// Restrict access to users with at least one of the specified roles.
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authentication middleware ran before checking permissions.
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.',
      });
    }

    // Deny access when the authenticated user's role is not allowed.
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of following roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};
