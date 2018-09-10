var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt')

/* GET users listing. */
router.post('/create', function(req, res) {
  const {
    username,
    password,
    passwordConfirmation,
    fullName,
    email,
    photos
  } = req.body
  if (password !== passwordConfirmation) throw 'Password confirmation mismatch'
  
})

module.exports = router;
