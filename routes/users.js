const bodyParser = require('body-parser');
const express = require('express');

const userControler = require('../controllers/userControler');

const router = express.Router();
router.get('/:uid', userControler.getUserById);

router.post('/signup', userControler.signup);
router.post('/login', userControler.login);



module.exports = router;