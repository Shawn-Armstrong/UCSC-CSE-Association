const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.sendStatus(401); // No token provided
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token is not valid
        }

        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
