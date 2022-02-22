const jsonWebToken = require("jsonwebtoken");
const models = require('../models');
// besoin de notre package Json.token permet de vérifier la validité d'un token 

//erreurs d'identifications: protéger mes routes

module.exports = (req, res, next) => {
    try {//il y a plusieurs éléments qui peuvent poser problème
        const token = req.headers.authorization.split(' ')[1];//recup token du headers =>table =>deuxieme el
         const decodedToken = jsonWebToken.verify(token,process.env.RANDOM_TOKEN_SECRET);//verif token/key
        const userId = decodedToken.userId;//recup userId dans le token
        //&&comparer le UserId qu'il y a en clair dans le req avec le userId qu'il y a dans le token
        if (req.body.userId && req.body.userId !== userId) {//!== est différent
            throw 'User ID non valable';//throw pour renvoyer à catch 
        } else {
            next();//passer au middelware suivant
        }     

    } catch (e) {
        if (e.name === "TokenExpiredError"&& jwt.verify(req.headers.authorization.refreshToken, process.env.REFRESH_TOKEN_SECRET) && jwt.verify(req.headers.authorization.refreshToken, process.env.REFRESH_TOKEN_SECRET).userId === 1) {
            models.User.findOne({ id: req.body.userId})
                .then(user => {
                    if (!user) {
                        res.status(401).json({ error: 'Utilisateur non trouvé' });
                    } else if (user.level === 0) {
                        res.status(401).json({ error: 'Utilisateur désactivé' });
                    } else {
                        //TODO generate new token
                        res.status(401).json({ error: "Token expiré" });
                    }
                })
        } else {
            res.status(401).json({
                error: e.message
            });
        }

    }
};