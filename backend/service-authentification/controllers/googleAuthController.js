exports.googleCallback = (req, res) => {
  // Redirige ou renvoie l'utilisateur connecté après Google OAuth
  res.json({ user: req.user });
};

exports.googleFailure = (req, res) => {
  res.status(401).json({ message: 'Échec de l\'authentification Google' });
}; 