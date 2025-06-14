const mongoose = require('mongoose');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // Production error response
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }

    // Handle specific errors
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            status: 'fail',
            message: 'Validation Error',
            errors
        });
    }

    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            status: 'fail',
            message: 'Duplicate field value entered'
        });
    }

    // Log error for debugging
    console.error('ERROR 💥', err);

    // Generic error response
    return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong'
    });
};

module.exports = {
    errorHandler,
    AppError
}; 