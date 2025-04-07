const express = require('express');
const nedb = require("nedb-promises");

const app = express();
const db = nedb.create('users.jsonl');

// Automatically decode JSON bodies in requests
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static('public'));

// GET /users - return all user documents
app.get('/users', (req, res) => {
    db.find({})
      .then(users => res.json(users))
      .catch(error => res.json({ error: error.message }));
});

// GET /users/:username - return a single user document by username
app.get('/users/:username', (req, res) => {
    db.findOne({ username: req.params.username })
      .then(doc => {
          if (doc) {
              res.json(doc);
          } else {
              res.json({ error: 'Username not found.' });
          }
      })
      .catch(error => res.json({ error: error.message }));
});

// POST /users - register a new user
app.post('/users', (req, res) => {
    const { username, password, email, name } = req.body;
    if (!username || !password || !email || !name) {
        return res.json({ error: 'Missing fields.' });
    }
    db.findOne({ username })
      .then(existing => {
          if (existing) {
              res.json({ error: 'Username already exists.' });
          } else {
              return db.insert({ username, password, email, name });
          }
      })
      .then(newUser => {
          if (newUser) res.json(newUser);
      })
      .catch(error => res.json({ error: error.message }));
});

// PATCH /users/:username - update a user document
app.patch('/users/:username', (req, res) => {
    db.update({ username: req.params.username }, { $set: req.body })
      .then(updatedCount => {
          if (updatedCount === 0) {
              res.json({ error: 'Something went wrong.' });
          } else {
              res.json({ ok: true });
          }
      })
      .catch(error => res.json({ error: error.message }));
});

// DELETE /users/:username - delete a user document
app.delete('/users/:username', (req, res) => {
    db.remove({ username: req.params.username })
      .then(deletedCount => {
          if (deletedCount === 0) {
              res.json({ error: 'Something went wrong.' });
          } else {
              res.json({ ok: true });
          }
      })
      .catch(error => res.json({ error: error.message }));
});

// Default route for any undefined URL
app.all('*', (req, res) => {
    res.status(404).json({ error: 'Invalid URL.' });
});

// Start the server on port 3000
app.listen(3000, () => console.log("Server started on http://localhost:3000"));
