const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cinemax_super_secret_jwt_token_key_2026_987654321';

// Verify customer/user JWT token
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Please log in to continue.'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: 'Session expired or invalid token. Please log in again.'
        });
    }
};

// Check if authenticated user is admin
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Forbidden. Admin privileges required for this action.'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    requireAdmin,
    JWT_SECRET
};
