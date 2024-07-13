// Middleware pour vérifier le rôle d'administrateur
const isAdmin = (req, res, next) => {
    if (req.user && req.user.roles === 'admin') {
        next(); 
    } else {
        res.status(403).send('Accès interdit');
    }
};

// Middleware pour vérifier si l'utilisateur est connecté
const isAuthenticated = (req, res, next) => {
    if (req.user) {
        next(); // L'utilisateur est connecté, on passe à la prochaine fonction
    } else {
        res.status(401).send('Non authentifié');
    }
};
