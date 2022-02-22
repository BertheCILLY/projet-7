const bcrypt = require("bcrypt");//importation de 
const User = require("../models/User");
const jsonWebToken = require("jsonwebtoken");


const passwordValidator = require('password-validator');
const {
  where
} = require('sequelize');

let schema = new passwordValidator(); //Shema MDP 
schema
  .is().min(2) // min 2 caractères
  .is().max(20) //max 20caractères
  .has().uppercase(1) // min 1 maj
  .has().lowercase(1) // min 1 minuscule
  .has().digits(1) // min 1 chiffre
  .has().not().spaces(0) // sans espace
  .is().not().oneOf(['Passw0rd', 'Password123']);


//on va hasher le mot de passe et avec hash crer par bcrypt on va enregistrer le user de la base de donnée, fonction asynchrone qui prend du temps 

exports.signup = (req, res, next) => {

  if (!schema.validate(req.body.password)) {
    res.status(400).json({
      error: "Le mot de passe n'ai pas assez sécurisé "
    })

  } else {
//cryptage du mot de passe -compare password/database/if base return token and use delais expiration
  bcrypt
    .hash(req.body.password, 10)//dix tour
    .then((hash) => {
      const user = new User({//nouvel utilisateur
        email: req.body.email,//adress fourni dans le corps de la requète
        username: req.body.username,
        password: hash,//mot de passe cripté
        bio: req.body.bio,
      });
      user
        .save()
        .then(() =>
          res.status(201).json({ message: "Nouveau utilisateur crée"  + User
        })//201 pour une création de ressouce
        )
        .catch((error) => res.status(400).json({ error: ' Erreur Utilisateur Signup !' }));//400 pour le différencier
    })
    .catch((error) => res.status(500).json({ error: 'utilisateur non crée' }));//erreur cerver qu'on envoie dans un objet
  }
};


//permet aux utilisateurs existants de se connecter
exports.login = (req, res, next) => {
 
//findOne pour trouver un seul utilisateur pour qui l'adress mail correspond
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt// la fonction compare récupère le mot de passe qui a été envoyé en clair par le front
        .compare(req.body.password, user.password)//si utilisateur trouvé on compare
        .then((valid) => {
          if (!valid) {//booléane si compraraison bon ou pas 
            return res
              .status(401)//si utilisateur non trouvé
              .json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            //encodage du UserId pour la création de nouveau objet(objet et UserId sont liés)
            userId: user._id,//fonction 'sign'de jsonwebtoken qui comprends les données qu'on veux ancoder
            isAdmin: user.isAdmin,
            token: jsonWebToken.sign(//3 arguments
              { userId: user._id,
                isAdmin: user.isAdmin
               },
               `${ process.env.RANDOM_TOKEN_SECRETT}`,
              { expiresIn: "24h" }
              //cryptage du mot de passe -compare password/database/if base return token and use delais expiration
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));//si problème MongoDB
    })
    .catch((error) => res.status(500).json({ error }));
};
// SUPPRIMER COMPTE UTILISATEUR

exports.userDelete = (req, res, next) => {

  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, `${process.env.TOP_SECRET}`);
  const UserId = decodedToken.UserId;
  const id = req.params.id
  const isAdmin = decodedToken.isAdmin;
  User.findOne({
    where: {
      id: id
    }
  })
    .then(user => {
      if (user.id === UserId || isAdmin === true) {
        User.destroy({
          where: {
            id: id
          }
        })

          .then(() => res.status(200).json({
            message: 'Utilisateur Supprimer !'
          }))
          .catch(error => res.status(404).json({
            message: ' Erreur Utilisateur non Supprimer !'
          }));
      } else {
        return res.status(401).json({
          error: "pas d autorisation !"
        })
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "Erreur DELETE USER "
      });
    })
};

// MODIFIER UTILISATEUR

exports.userUpdate = (req, res, next) => {
  const id = req.params.id;

  User.findOne({
    where: {
      id: id
    }
  })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          error: 'Utilisateur non trouvé !'
        })

      } else {
        user.update({
          username: req.body.username,
          job: req.body.job,
          bio: req.body.bio
        })
          .then(() => res.status(200).json({
            message: 'Utilisateur Modifier!'
          }))

          .catch(error => res.status(404).json({
            message: 'Erreur Utilisateur non Modifié !'
          }))
      }
    })
    .catch(error => res.status(404).json({
      message: 'Erreur fonction update !'
    }))
}

// RECUPERER UN UTILISATEUR 

exports.userGetOne = (req, res, next) => {
  const id = req.params.id;
  User.findOne({
    where: {
      id: id
    }
  })
    .then(user => res.status(200).json(user))

    .catch(err => {
      res.status(500).send({
        message: "Erreur utilisateur non trouver"

      })
    })
};