const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const speakeasy = require('speakeasy');


require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

exports.create = async (req, res) => {
  const { prenom, nom, email, password, password2 } = req.body;

  if (!prenom || !nom || !email || !password || !password2) {
    return res.status(400).send({
      message: 'Veuillez renseigner toutes les données nécessaires'
    });
  }

  if (password !== password2) {
    return res.status(400).send({
      message: 'Les mots de passe ne correspondent pas'
    });
  }

  try {
    User.findByEmail(email, async (err, existingUser) => {
      if (err) {
        return res.status(500).send({
          message: err.message || 'Une erreur s\'est produite lors de la vérification de l\'utilisateur'
        });
      }

      if (existingUser) {
        return res.status(400).send({
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // Générer le secret 2FA
      const secret = speakeasy.generateSecret({ length: 20 });

      const newUser = new User({
        prenom,
        nom,
        email,
        password: hashedPassword,
        password2: hashedPassword,
        role_id: 1,
        email_activate: false,
        two_factor_secret: secret.base32,
        two_factor_enabled: false
      });

      User.create(newUser, (err, data) => {
        if (err) {
          return res.status(500).send({
            message: err.message || 'Une erreur s\'est produite lors de la création de l\'utilisateur'
          });
        }

        const token = jwt.sign({ id: data.id }, SECRET_KEY, {
          expiresIn: '24h'
        });

        const mailConfigurations = {
          from: 'ivan.djuric@railsware.com',
          to: email,
          subject: 'Instruction de validation d\'email',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                  <h2 style="text-align: center; color: #4CAF50;">Bienvenue!</h2>
                  <p>Bonjour,</p>
                  <p>Je suis ravi de vous compter parmi nous.</p>
                  <p>Veuillez vérifier et valider votre adresse email en cliquant sur le lien ci-dessous :</p>
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:4000/api/user/verify/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a>
                  </div>
                  <p>Le lien sera invalide dans 10 minutes.</p>
                  <p>Merci,</p>
                  <p>L'équipe</p>
                </div>
              </body>
            </html>
          `
        };

        transporter.sendMail(mailConfigurations, function (error, info) {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send({ message: 'Error sending email' });
          }
          console.log('Email Sent Successfully');
          console.log(info);
          res.send({ message: 'Email Sent Successfully', info });
        });
      });
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Une erreur s\'est produite lors de la création de l\'utilisateur'
    });
  }
};

exports.findAll = (req, res) => {
  User.findAll((err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Une erreur s\'est produite lors de la récupération des utilisateurs'
      });
    } else {
      res.send(data);
    }
  });
};

exports.auth = async (req, res) => {
  const { email, password } = req.body;

  User.authenticate(email, async (err, user) => {
    if (err) {
      return res.status(403).send({ message: err.message });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(403).send({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, role: user.role_id }, SECRET_KEY, { expiresIn: '24h' });

    res.status(200).send({ token });
  });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    User.updateEmailActivate(userId, (err, data) => {
      if (err) {
        return res.status(500).send({
          message: 'Une erreur s\'est produite lors de la vérification de l\'email'
        });
      }
      res.send({
        message: 'Email vérifié avec succès'
      });
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).send({
      message: 'Le lien de vérification est invalide ou a expiré'
    });
  }
};

exports.sendVerificationEmail = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: 'Une adresse email est requis' });
  }

  const token = jwt.sign(
    { data: email },
    SECRET_KEY,
    { expiresIn: '10m' }
  );

  const mailConfigurations = {
    from: 'ivan.djuric@railsware.com',
    to: email,
    subject: 'Instruction de validation d\'email',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #4CAF50;">Bienvenue!</h2>
            <p>Bonjour,</p>
            <p>Je suis ravi de vous compter parmi nous.</p>
            <p>Veuillez vérifier et valider votre adresse email en cliquant sur le lien ci-dessous :</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="http://localhost:4000/api/user/verify/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a>
            </div>
            <p>Le lien sera invalide 10 minutes.</p>
            <p>Merci,</p>
            <p>L'équipe</p>
          </div>
        </body>
      </html>
    `
  };

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send({ message: 'Error sending email' });
    }
    console.log('Email Sent Successfully');
    console.log(info);
    res.send({ message: 'Email Sent Successfully', info });
  });
};

exports.forgetPassword = (req, res) => {
  const { email } = req.body;

  User.findByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).send({ message: 'Erreur lors de la vérification de l\'email' });
    }
    if (!user) {
      return res.status(404).send('Email introuvable');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 heure

    User.storeResetToken(user.id, token, tokenExpiry, (err, result) => {
      if (err) {
        return res.status(500).send('Erreur lors de la génération du token de réinitialisation');
      }

      const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="text-align: center; color: #4CAF50;">Réinitialisation de mot de passe</h2>
                <p>Bonjour,</p>
                <p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:4000/api/user/reset-password/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
                </div>
                <p>Le lien sera invalide dans 1 heure.</p>
                <p>Merci,</p>
                <p>L'équipe</p>
              </div>
            </body>
          </html>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).send('Erreur d\'envoi d\'email');
        } else {
          console.log(`Email envoyé: ${info.response}`);
          res.status(200).send('Cliquez sur le lien et suivez les instructions pour réinitialiser votre mot de passe');
        }
      });
    });
  });
};
exports.resetPassword = (req, res) => {
  const { token } = req.params;

  User.findByResetToken(token, (err, user) => {
    if (err) {
      return res.status(500).send('Erreur lors de la vérification du token');
    }
    if (!user) {
      return res.status(404).send('Token invalide ou expiré');
    }
    res.send(
      `<form method="post" action="/api/user/update-password">
        <input type="hidden" name="token" value="${token}" />
        <input type="password" name="password" required placeholder="Nouveau mot de passe"/>
        <input type="submit" value="Reset Password" />
      </form>`
    );
  });
};

exports.updatePassword = (req, res) => {
  const { token, password } = req.body;

  User.findByResetToken(token, (err, user) => {
    if (err) {
      return res.status(500).send('Erreur lors de la vérification du token');
    }
    if (!user) {
      return res.status(404).send('Token invalide ou expiré');
    }

    User.updatePassword(user.id, password, (err, result) => {
      if (err) {
        return res.status(500).send('Erreur lors de la mise à jour du mot de passe');
      }

      User.clearResetToken(user.id, (err) => {
        if (err) {
          return res.status(500).send('Erreur lors de la suppression du token de réinitialisation');
        }

        res.status(200).send('Mot de passe mis à jour avec succès');
      });
    });
  });
};
