const models = require('../models');
const fs = require('fs');



//get
exports.getAllview = (req, res, next) => {
    models.Message.findAll({ include: [{ model: models.UserMessages, include: models.User }, { model: models.Like }, { model: models.Comment }] }).then

};