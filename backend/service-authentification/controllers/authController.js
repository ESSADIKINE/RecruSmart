const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis.' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Utilisateur déjà existant.' });
    const user = await User.create({ email, password, name, role });
    res.status(201).json({ message: 'Utilisateur créé', user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Identifiants invalides.' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Identifiants invalides.' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}; 