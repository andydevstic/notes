var express = require('express');
var router = express.Router();
const db = require('../models/db')

/* GET home page. */
router.get('/', function (req, res, next) {
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
      res.render('index', {
        title: 'My notes',
        notelist: noteList
      })
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: err.message,
        error
      })
    })
})

router.post('/notes/add', function (req, res) {
  const {
    notekey,
    title,
    body
  } = req.body
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
      if (keyResult.rowCount === 0) throw 'Cannot insert new keys'
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

router.get('/notes/add', function (req, res) {
  res.render('notecreate', {
    title: 'Add note',
    docreate: true,
    note: {}
  })
})

router.get('/notes/edit', function (req, res) {
  const {
    id
  } = req.query
  const queryParams = [id]
  const noteSql =
    `SELECT * FROM tbl_notes
     WHERE id = $1
    `
  const keySql =
    `SELECT key FROM tbl_keys
     WHERE note_id = $1
    `
  Promise.all([db.run(noteSql, queryParams), db.run(keySql, queryParams)])
    .then(([noteQueryResult, keyQueryResult]) => {
      if (noteQueryResult.rows.length === 0) throw 'Note does not exist'
      const note = noteQueryResult.rows[0]
      const keys = keyQueryResult.rows.map(i => i.key).join(', ')
      res.render('noteedit.ejs', {
        title: 'Edit note',
        docreate: false,
        note,
        notekey: keys
      })
    })
    .catch(error => {
      console.log(error)
      res.render('error', {
        message: error.message,
        error
      })
    })
})

router.post('/notes/edit', function (req, res) {
  const {
    id,
    notekey,
    title,
    body
  } = req.body
  const keyList = notekey && notekey.length > 0 && notekey.split(',') || []
  keyList.map(item => item.toLowerCase().trim())
  const noteSQL =
    `UPDATE tbl_notes SET title = $1, body = $2
     WHERE id = $3 RETURNING *;
    `
  db.run(noteSQL, [title, body, id])
    .then(noteResult => {
      if (noteResult.rowCount === 0) throw 'Cannot update note'
      res.redirect('/')
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: err.message,
        error: err
      })
    })
})

router.get('/notes/destroy', function (req, res) {
  const {
    id
  } = req.query
  const sql =
    `DELETE FROM tbl_notes
     WHERE id = $1
    `
  db.run(sql, [id])
    .then(noteResult => {
      if (noteResult.rowCount === 0) throw 'Cannot delete note'
      res.redirect('/')
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: err.message,
        error: err
      })
    })
})

router.get('/notes/view', function (req, res) {
  const {
    id
  } = req.query
  const queryParams = [id]
  const noteSql =
    `SELECT * FROM tbl_notes
     WHERE id = $1
    `
  const keySql =
    `SELECT key FROM tbl_keys
     WHERE note_id = $1
    `
  Promise.all([db.run(noteSql, queryParams), db.run(keySql, queryParams)])
    .then(([noteQueryResult, keyQueryResult]) => {
      if (noteQueryResult.rows.length === 0) throw 'Note does not exist'
      const note = noteQueryResult.rows[0]
      const keys = keyQueryResult.rows.map(i => i.key).join(', ')
      res.render('noteview', {
        title: 'Note detail',
        note,
        notekey: keys
      })
    })
    .catch(error => {
      console.log(error)
      res.render('error', {
        message: error.message,
        error
      })
    })
})

module.exports = router;