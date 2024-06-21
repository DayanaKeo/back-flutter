const speakeasy = require('speakeasy');
const User = require('../../model/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

exports.login = async (req, res) => {
    const { email, password, code } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: 'Veuillez fournir une adresse email et un mot de passe' });
    }

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).send({ message: 'Utilisateur non trouvé' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ message: 'Mot de passe incorrect' });
        }

        if (!user.email_activate) {
            return res.status(401).send({ message: 'Veuillez d\'abord activer votre adresse email' });
        }

        if (!user.two_factor_enabled) {
            const token = speakeasy.totp({
                secret: user.two_factor_secret,
                encoding: 'base32',
                digits: 5,
                step: 600,
                window: 1
            });

            user.two_factor_secret = token;
            await User.saveUser(user);

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: user.email,
                subject: 'Activation de la double authentification',
                text: `Votre code secret pour activer la double authentification est : ${token}. 
                       Cliquez sur le lien suivant pour activer : http://localhost:4000/api/auth/verify-2fa?userId=${user.id}`,
                html: `<p>Votre code secret pour activer la double authentification est : <strong>${user.two_factor_secret}</strong></p>
                       <p>Cliquez sur le lien suivant pour activer :</p>
                       <a href="http://localhost:4000/api/auth/verify-2fa?userId=${user.id}">Activer la double authentification</a>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Erreur lors de l\'envoi de l\'email :', error);
                    return res.status(500).send({ message: 'Erreur lors de l\'envoi de l\'email' });
                }
                console.log('Email envoyé :', info.response);

                res.status(200).send({
                    message: 'Vous êtes connecté. Veuillez activer la double authentification pour plus de sécurité.',
                    activate2faUrl: `http://localhost:4000/api/auth/verify-2fa?userId=${user.id}`
                });
            });
        } else {
            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: code,
                digits: 5,
                step: 600,
                window: 1
            });

            if (!verified) {
                return res.status(401).send({ message: 'Code 2FA invalide' });
            }

            const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
            res.status(200).send({
                message: 'Connexion réussie',
                token: token,
                user: {
                    id: user.id,
                    prenom: user.prenom,
                    nom: user.nom,
                    email: user.email
                }
            });
        }
    } catch (err) {
        console.error('Erreur lors de la connexion :', err);
        res.status(500).send({ message: 'Erreur serveur lors de la connexion' });
    }
};

exports.verifyTokenWithUserId = async (req, res) => {
    const { userId, code } = req.body;

    try {
        if (!userId || !code) {
            return res.status(400).send('UserId ou code non fourni');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Utilisateur non trouvé');
        }

        const verified = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: code,
            digits: 5,
            step: 600,
            window: 1
        });

        if (!verified) {
            user.two_factor_enabled = true;
            User.saveUser(user);
            res.send('Code vérifié avec succès et 2FA activé');
        } else {
            res.status(401).send('Code invalide');
        }
    } catch (err) {
        console.error('Erreur lors de la vérification du token 2FA :', err);
        res.status(500).send('Erreur serveur lors de la vérification du token 2FA');
    }
};

exports.showVerify2faPage = (req, res) => {
    const { userId } = req.query;
    res.send(`
        <html>
            <body>
                <form action="/api/auth/verify-2fa-code?=${userId}" method="POST">
                    <input type="hidden" name="userId" value="${userId}">
                    <label for="code">Enter your 2FA code:</label>
                    <input type="text" id="code" name="code">
                    <button type="submit">Verify</button>
                </form>
            </body>
        </html>
    `);
};

exports.sendActivate2fa = async (req, res) => {
    const { userId } = req.query;

    User.findById(userId, (err, user) => {
        if (err || !user) {
            console.error('Erreur lors de la recherche de l\'utilisateur :', err);
            return res.status(404).send('Utilisateur non trouvé');
        }

        if (!user.two_factor_secret) {
            user.two_factor_secret = speakeasy.generateSecret({ length: 20 }).base32;
            User.saveUser(user, (err) => {
                if (err) {
                    console.error('Erreur lors de la sauvegarde du secret 2FA :', err);
                    return res.status(500).send('Erreur serveur lors de la sauvegarde du secret 2FA');
                }
            });
        }

        const token = speakeasy.totp({
            secret: user.two_factor_secret,
            encoding: 'base32',
            digits: 5,
            step: 600,
            window: 1
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: user.email,
            subject: 'Votre code de vérification 2FA',
            text: `Votre code de vérification est : ${token}. 
                   Cliquez sur le lien suivant pour vérifier votre code : 
                   http://localhost:4000/api/auth/verify-2fa?userId=${user.id}`,
            html: `<p>Votre code de vérification est : <strong>${token}</strong></p>
                   <p>Cliquez sur le lien suivant pour vérifier votre code :</p>
                   <a href="http://localhost:4000/api/auth/verify-2fa?userId=${user.id}">Vérifiez votre code</a>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Erreur lors de l\'envoi de l\'email :', error);
                return res.status(500).send('Erreur serveur lors de l\'envoi de l\'email');
            }
            console.log('Email envoyé :', info.response);
            res.redirect(`/verify-2fa?userId=${userId}`);
        });
    });
};