const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middlewares/errorHandler');

// Service URLs from environment variables
const CANDIDATS_SERVICE_URL = process.env.CANDIDATS_SERVICE_URL || 'http://localhost:8084';
const INTELLIGENCE_SERVICE_URL = process.env.INTELLIGENCE_SERVICE_URL || 'http://localhost:5002';

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
        const user = await User.create({ email, password, name, role });
        const token = createToken(user);

        res.status(201).json({
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

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Invalid email or password', 401);
        }

        if (!user.isActiveUser()) {
            throw new AppError('Account is inactive', 403);
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

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // If user is a candidate, delete profile in candidates service
        if (user.role === 'CANDIDAT') {
            try {
                const token = createToken(user);
                const response = await fetch(`${CANDIDATS_SERVICE_URL}/api/candidats/profil/${user._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    console.error('Failed to delete candidate profile:', await response.text());
                }
            } catch (error) {
                console.error('Error deleting candidate profile:', error);
            }
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        next(err);
    }
}; 