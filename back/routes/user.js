const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/:id', userCtrl.getOneUser);
router.put('/:id', auth, userCtrl.modifyUser);
router.delete('/:id', auth, userCtrl.deleteUser);

module.exports = router;