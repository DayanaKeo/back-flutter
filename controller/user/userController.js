const User = require('../../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const Tuteur = require('../../model/tuteurModel');

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
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).send({
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Générer le secret 2FA
    const secret = speakeasy.generateSecret({ length: 20 });

    const newUser = {
      prenom,
      nom,
      email,
      password: hashedPassword,
      password2: hashedPassword,
      role_id: 1,
      email_activate: false,
      two_factor_secret: secret.base32,
      two_factor_enabled: false,
    };

    const data = await User.create(newUser);

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

    transporter.sendMail(mailConfigurations, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send({ message: 'Error sending email' });
      }
      console.log('Email Sent Successfully');
      console.log(info);
      res.send({ message: 'Email Sent Successfully', info });
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Une erreur s\'est produite lors de la création de l\'utilisateur'
    });
  }
};

exports.findById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        message: `Utilisateur non trouvé avec l'id ${id}`
      });
    }

    // Récupérer les détails du tuteur
    const tuteur = await Tuteur.findTuteurById(user.id);

    // Ajoutez les détails du tuteur à l'objet user
    user.tuteur = tuteur;

    res.status(200).send(user);
  } catch (error) {
    if (error.kind === "not_found") {
      return res.status(404).send({
        message: `Utilisateur non trouvé avec l'id ${id}`
      });
    } else {
      return res.status(500).send({
        message: `Erreur lors de la récupération de l'utilisateur avec l'id ${id}`
      });
    }
  }
};

// exports.findById = (req, res) => {
//   User.findById((err, data) => {
//     if(err) {
//       res.status(500).send({
//         message: err.message || 'Une erreur s\'est produit lors de la récupération des informations'
//       });
//     } else {
//       res.send(data);
//     }
//   });
// };

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

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(404).send('Email introuvable');

    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 heure

    await User.storeResetToken(user.id, token, tokenExpiry);

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
        console.error(error);
        return res.status(500).send('Erreur d\'envoi d\'email');
      } else {
        console.log(`Email envoyé: ${info.response}`);
        return res.status(200).send('Cliquez sur le lien et suivez les instructions pour réinitialiser votre mot de passe');
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur lors de la demande de réinitialisation de mot de passe');
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findByResetToken(token);
    if (!user) return res.status(404).send('Token invalide ou expiré');
    res.send(
      `<form method="post" action="/api/user/update-password">
        <input type="hidden" name="token" value="${token}" />
        <input type="password" name="password" required placeholder="Nouveau mot de passe"/>
        <input type="submit" value="Reset Password" />
      </form>`
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur lors de la vérification du token');
  }
};

exports.updatePassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const user = await User.findByResetToken(token);
    if (!user) return res.status(404).send('Token invalide ou expiré');

    await User.updatePassword(user.id, password);
    await User.clearResetToken(user.id);

    return res.status(200).send('Mot de passe mis à jour avec succès');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Erreur lors de la mise à jour du mot de passe');
  }
};


exports.update = async (req, res) => {
  const { id, prenom, nom, password } = req.body;

  if (!id) {
    return res.status(400).send({ message: 'ID utilisateur manquant' });
  }

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).send({ message: `Utilisateur non trouvé avec l'id ${id}` });
    }

    const updatedUser = {};

    if (prenom) updatedUser.prenom = prenom;
    if (nom) updatedUser.nom = nom;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedUser.password = hashedPassword;
    }

    const data = await User.updateById(id, updatedUser);

    res.status(200).send({
      message: 'Profil utilisateur mis à jour avec succès',
      data
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Une erreur s\'est produite lors de la mise à jour du profil utilisateur'
    });
  }
};
