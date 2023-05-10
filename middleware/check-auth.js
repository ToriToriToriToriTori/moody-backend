const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            const error = new Error('Auth failed'); error.code = 401;
            throw error;
        }
        const decodedToken = jwt.verify(token, 'supersecret');
        req.userData = {userId: decodedToken.userId};
        next();
    } catch (err) {
        const error = new Error('Auth failed'); error.code = 401;
        return next(error);
    }
   
}