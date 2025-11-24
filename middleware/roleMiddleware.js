// Declare globally allowed roles in your system
const SYSTEM_ROLES = ["admin", "pharmacist", "user"];

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // User must be authenticated first
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userRole = req.user.role;

            console.log("USER ROLE:", userRole);
            console.log("ALLOWED ROLES MIDDLEWARE EXPECTS:", allowedRoles);

            // If user role doesn't exist or is not recognized
            if (!userRole || !SYSTEM_ROLES.includes(userRole)) {
                return res.status(403).json({ error: "Invalid or missing user role" });
            }

            // Normalize case
            const normalizedAllowed = allowedRoles.map(role => role.toLowerCase());
            const normalizedUserRole = userRole.toLowerCase();

            // If user role not allowed
            if (!normalizedAllowed.includes(normalizedUserRole)) {
                return res.status(403).json({ error: "Access denied" });
            }

            // Access granted
            next();

        } catch (err) {
            console.error("ROLE MIDDLEWARE ERROR:", err);
            return res.status(500).json({ error: "Server error" });
        }
    };
};

module.exports = roleMiddleware;
