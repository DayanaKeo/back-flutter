const speakeasy = require('speakeasy');
const User = require('../../model/user');

exports.generateSecret = async (req, res) => {
    const { email } = req.body;
  
    try {
      User.findByEmail(email, async (err, user) => {
        if (err) {
          console.error('Erreur lors de la recherche de l\'utilisateur :', err);
          return res.status(500).send('Erreur serveur lors de la recherche de l\'utilisateur');
        }
  
        if (!user) {
          return res.status(404).send('Utilisateur non trouvé');
        }
  
        const secret = speakeasy.generateSecret({ length: 20 });
        user.two_factor_secret = secret.base32;
  
        User.saveUser(user, (err, result) => {
          if (err) {
            console.error('Erreur lors de la sauvegarde du secret 2FA :', err);
            return res.status(500).send('Erreur serveur lors de la sauvegarde du secret 2FA');
          }
          res.json({ secret: secret.base32 });
        });
      });
    } catch (err) {
      console.error('Erreur lors de la génération du secret :', err);
      res.status(500).send('Erreur serveur lors de la génération du secret');
    }
};

exports.generateToken = (req, res) => {
    const { email } = req.body;
  
    User.findByEmail(email, (err, user) => {
      if (err) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', err);
        return res.status(500).send('Erreur serveur lors de la recherche de l\'utilisateur');
      }
  
      if (!user || !user.two_factor_secret) {
        return res.status(404).send('Utilisateur non trouvé ou secret 2FA non généré');
      }

      // Définir la période de validité du token (en secondes)
        const tokenValiditySeconds = 3600;
  
      const token = speakeasy.totp({
        secret: user.two_factor_secret,
        encoding: 'base32',
        digits: 5,
        step: tokenValiditySeconds,

      });
  
      res.json({ token: token });
    });
  };

exports.verifyToken = async (req, res) => {
  const { email, token } = req.body;

  try {
    User.findByEmail(email, async (err, user) => {
      if (err) {
        console.error('Erreur lors de la recherche de l\'utilisateur :', err);
        return res.status(500).send('Erreur serveur lors de la recherche de l\'utilisateur');
      }

      if (!user || !user.two_factor_secret) {
        return res.status(404).send('Utilisateur non trouvé ou secret 2FA non généré');
      }

      User.verifyTwoFactorToken(user.id, token, (err, result) => {
        if (err) {
          console.error('Erreur lors de la vérification du token 2FA :', err);
          return res.status(400).send(err.message || 'Erreur lors de la vérification du token 2FA');
        }
        res.send(result.message);
      });
    });
  } catch (err) {
    console.error('Erreur lors de la vérification du token 2FA :', err);
    res.status(500).send('Erreur serveur lors de la vérification du token 2FA');
  }
};