var jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.log("Admin Middleware Rejected:", req.user);
        res.status(403).json({ msg: 'Access denied: Admins only' });
    }
};
