const speakeasy = require('speakeasy');
const User = require('../../model/user');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

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

        const tokenValiditySeconds = 3600;

        const token = speakeasy.totp({
            secret: user.two_factor_secret,
            encoding: 'base32',
            digits: 5,
            step: tokenValiditySeconds,
            window: 1
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
                   http://localhost:4000/api/two-factor/verify-2fa?userId=${user.id}`,
            html: `<p>Votre code de vérification est : <strong>${token}</strong></p>
                   <p>Cliquez sur le lien suivant pour vérifier votre code :</p>
                   <a href="http://localhost:4000/api/two-factor/verify-2fa?userId=${user.id}">Vérifiez votre code</a>`
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

exports.verifyTokenWithUserId = async (req, res) => {
    const { userId, code } = req.body;

    try {
        User.findById(userId, (err, user) => {
            if (err || !user) {
                console.error('Erreur lors de la recherche de l\'utilisateur :', err);
                return res.status(404).send('Utilisateur non trouvé');
            }

            const verified = speakeasy.totp.verify({
                secret: user.two_factor_secret,
                encoding: 'base32',
                token: code,
                digits: 5,
                step: 600,
                window: 1 // Tolère une déviation d'une période de temps (ex: 30s si step=30s)
            });

            if (verified) {
                // Met à jour le champ two_factor_enabled à true
                user.two_factor_enabled = true;
                User.saveUser(user, (err) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
                        return res.status(500).send('Erreur serveur lors de la mise à jour de l\'utilisateur');
                    }
                    res.send('Code vérifié avec succès et 2FA activé');
                });
            } else {
                res.send('Code invalide');
            }
        });
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
                <form action="/api/two-factor/verify-2fa-code?=${userId}" method="POST">
                    <input type="hidden" name="userId" value="${userId}">
                    <label for="code">Enter your 2FA code:</label>
                    <input type="text" id="code" name="code">
                    <button type="submit">Verify</button>
                </form>
            </body>
        </html>
    `);
};
