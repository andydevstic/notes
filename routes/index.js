var express = require('express');
var router = express.Router();
const db = require('../models/db')

/* GET home page. */
router.get('/', function(req, res, next) {
  const noteListSQL =
    `SELECT * FROM tbl_notes
     ORDER BY title ASC;
    `
  const keyListSQL = 
    `SELECT DISTINCT key
     FROM tbl_keys
     ORDER BY key ASC;
    `
  Promise.all([db.run(noteListSQL), db.run(keyListSQL)])
    .then(([noteList, keyList]) => {
      res.render('index', {title: 'My notes', notelist: noteList, keylist: keyList})
    })
    .catch(err => {
      console.log(err)
      res.render('error', {message: err.message, error})
    })
});

router.get('/notes/add', function(req, res) {
  res.render('noteedit.ejs', {title: 'Add note', docreate: 'create', note: {}})
})

module.exports = router;
