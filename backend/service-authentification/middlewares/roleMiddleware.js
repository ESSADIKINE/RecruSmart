const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.' 
      });
    }

    next();
  };
};

module.exports = {
  isAdmin: checkRole(['ADMIN']),
  isRecruteur: checkRole(['RECRUTEUR', 'ADMIN']),
  isCandidat: checkRole(['CANDIDAT']),
  isAdminOrRecruteur: checkRole(['ADMIN', 'RECRUTEUR'])
}; 