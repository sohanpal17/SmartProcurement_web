const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026');
        req.user = decoded;
        return next();
    } catch (err) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ success: false, error: 'Invalid or expired authorization token' });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, phone, is_approved, mandi_id')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email,
            role: profile ? profile.role : 'farmer',
            name: profile ? profile.full_name : 'Farmer',
            isApproved: profile ? profile.is_approved : true,
            mandiId: profile ? profile.mandi_id : null,
        };
        return next();
    }
};

// Middleware: Mandi Admin Only
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied: Admin authorization required' });
    }
    next();
};

// Middleware: Mandi Admin OR Approved Officer
const requireAdminOrOfficer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
        return next();
    }

    if (req.user.role === 'officer' && req.user.isApproved) {
        return next();
    }

    return res.status(403).json({
        success: false,
        error: 'Access denied: Requires Mandi Admin or Approved Officer privileges.',
    });
};

module.exports = { authenticateUser, requireAdmin, requireAdminOrOfficer };
