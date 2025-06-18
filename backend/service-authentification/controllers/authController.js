const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middlewares/errorHandler');
const { publishEvent } = require('../config/rabbitmq');
const crypto = require('crypto');

// Helper function to create JWT token
const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Helper function to validate user data
const validateUserData = (data) => {
    const { email, password, name, role } = data;
    const errors = [];

    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (password && password.length < 6) errors.push('Password must be at least 6 characters');
    if (role && !['CANDIDAT', 'RECRUTEUR', 'ADMIN'].includes(role)) {
        errors.push('Invalid role');
    }

    return errors;
};

exports.register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;

        // Validate input
        const errors = validateUserData(req.body);
        if (errors.length > 0) {
            throw new AppError(errors.join(', '), 400);
        }

        // Check if user exists
        const exists = await User.findOne({ email });
        if (exists) {
            throw new AppError('User already exists', 409);
        }

        // Create user
        const user = await User.create({
            email,
            password,
            name,
            role,
            isActive: false,
            isEmailVerified: false
        });
        const token = createToken(user);

        // Envoi OTP après inscription
        await exports.sendOTP({ body: { email }, ...req }, res, next);
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }
        if (!user.isEmailVerified) {
            throw new AppError('Veuillez vérifier votre e-mail', 403);
        }
        if (!user.isActiveUser()) {
            throw new AppError('Compte désactivé', 403);
        }
        if (!(await user.comparePassword(password))) {
            throw new AppError('Invalid email or password', 401);
        }
        const token = createToken(user);
        await user.updateLastLogin();
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                },
                token
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    name: req.user.name,
                    role: req.user.role
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                }))
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new AppError('User not found', 404);

        const otpCode = (Math.floor(100000 + Math.random() * 900000)).toString();
        user.otpCode = otpCode;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        await publishEvent('Auth.OTP.Sent', {
            utilisateurId: user._id,
            email: user.email,
            code: otpCode,
            prenom: user.name
        });

        res.json({ success: true, message: 'OTP envoyé' });
    } catch (err) {
        next(err);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otpCode !== code || user.otpExpires < Date.now()) {
            throw new AppError('OTP invalide ou expiré', 400);
        }
        user.isEmailVerified = true;
        user.isActive = true;
        user.otpCode = undefined;
        user.otpExpires = undefined;
        await user.save();

        await publishEvent('Auth.Account.Created', {
            utilisateurId: user._id,
            email: user.email,
            prenom: user.name
        });

        res.json({ success: true, message: 'Email vérifié' });
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new AppError('User not found', 404);

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
        await user.save();

        await publishEvent('Auth.PasswordReset.Requested', {
            utilisateurId: user._id,
            email: user.email,
            prenom: user.name,
            resetToken
        });

        res.json({ success: true, message: 'Email de réinitialisation envoyé' });
    } catch (err) {
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, resetToken, newPassword } = req.body;
        const user = await User.findOne({ email, resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) throw new AppError('Token invalide ou expiré', 400);

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Mot de passe réinitialisé' });
    } catch (err) {
        next(err);
    }
}; 