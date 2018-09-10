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
    `SELECT *
     FROM tbl_keys
     ORDER BY note_id ASC;
    `
  Promise.all([db.run(noteListSQL), db.run(keyListSQL)])
    .then(([noteQueryResult, keyQueryResult]) => {
      const noteList = noteQueryResult.rows
      const keyList = keyQueryResult.rows
      keyList.map(item => {
        const foundNote = noteList.find(note => note.id === item.note_id)
        if (foundNote) {
          if (foundNote.keys === undefined) foundNote.keys = [item.key]
          else foundNote.keys.push(item.key)
        }
      })
      noteList.map(item => {
        item.keys = item.keys && item.keys.join(', ') || 'No key was registered'
        return item
      })
      res.render('index', {title: 'My notes', notelist: noteList})
    })
    .catch(err => {
      console.log(err)
      res.render('error', {message: err.message, error})
    })
});

router.get('/notes/add', function(req, res) {
  res.render('noteedit.ejs', {title: 'Add note', docreate: 'create', note: {}})
})

router.post('/notes/add', function(req, res) {
  const {notekey, title, body} = req.body
  const keyList = notekey && notekey.length > 0 && notekey.split(',') || []
  keyList.map(item => item.toLowerCase().trim())
  const noteSQL =
    `INSERT INTO tbl_notes(title, body)
     VALUES ($1, $2) RETURNING *;
    `
  db.run(noteSQL, [title, body])
    .then(noteResult => {
      if (noteResult.rowCount === 0) throw 'Cannot insert new note'
      const noteID = noteResult.rows[0].id
      const params = [noteID]
      let keySQL =
        `INSERT INTO tbl_keys(note_id, key)
         VALUES `
      keyList.forEach((key, index) => {
        keySQL += `($1, $${index + 2})`
        if (index !== keyList.length - 1) keySQL += ', '
        else keySQL += ' '
        params.push(key)
      })
      keySQL += 'RETURNING *'
      return db.run(keySQL, params)
    })
    .then(keyResult => {
      if ( keyResult.rowCount === 0 ) throw 'Cannot insert new keys'
      res.redirect('/')
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: err.message,
        error
      })
    })
})

router.get('/notes/view?id=:id', function(req, res) {
  const {noteID} = req.params
  const noteSql =
    `SELECT * FROM tbl_notes
     WHERE id = $1
    `
  const keySql =
    `SELECT key FROM tbl_keys
     WHERE note_id = $1
    `
  Promise.all([db.run(noteSql, [noteID]), db.run(keySql, [noteID])])
    .then(([noteQueryResult, keyQueryResult]) => {
      if (noteQueryResult.rows.length === 0) throw 'Note does not exist'
      const note = result.rows[0]
      console.log(note)
      console.log(keyQueryResult.rows)
      res.render('noteview', {note})
    })
})

module.exports = router;
