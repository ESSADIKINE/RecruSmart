const ROLES = {
    ADMIN: 'ADMIN',
    RECRUTEUR: 'RECRUTEUR',
    CANDIDAT: 'CANDIDAT'
};

const ROLE_HIERARCHY = {
    [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.RECRUTEUR, ROLES.CANDIDAT],
    [ROLES.RECRUTEUR]: [ROLES.RECRUTEUR, ROLES.CANDIDAT],
    [ROLES.CANDIDAT]: [ROLES.CANDIDAT]
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user exists
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check if user is active
            if (!req.user.isActiveUser()) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
            }

            // Get user's role hierarchy
            const userRoleHierarchy = ROLE_HIERARCHY[req.user.role] || [];
            
            // Check if user has any of the allowed roles
            const hasPermission = allowedRoles.some(role => 
                userRoleHierarchy.includes(role)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    required: allowedRoles,
                    current: req.user.role
                });
            }

            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
};

module.exports = {
    ROLES,
    isAdmin: checkRole([ROLES.ADMIN]),
    isRecruteur: checkRole([ROLES.RECRUTEUR, ROLES.ADMIN]),
    isCandidat: checkRole([ROLES.CANDIDAT]),
    isAdminOrRecruteur: checkRole([ROLES.ADMIN, ROLES.RECRUTEUR]),
    checkRole
}; 