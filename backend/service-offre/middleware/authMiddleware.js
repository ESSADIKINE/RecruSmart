const jwt = require('jsonwebtoken');

function verifyJwt(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length && (!decoded.role || !roles.includes(decoded.role))) {
        return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
      }
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token invalide' });
    }
  };
}

module.exports = verifyJwt; 