const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const authController = require('../controller/user/authController');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'Accès refusé. Aucun token fourni.' });
  }

  const token = authHeader.split(' ')[1];

  if (authController.isTokenBlacklisted(token)) {
    return res.status(403).send({ message: 'Token est blacklisté' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send({ message: 'Token invalide.' });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateJWT;
