require('dotenv').config();
const express=require('express');
const mysql=require('mysql2');
const bodyParser=require('body-parser');

const app=express();
const port=3000;

app.use(bodyParser.json());

const db=mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
  if (err) throw err;
  console.log(`Database "${process.env.DB_NAME}" is ready`);

  db.changeUser({ database: process.env.DB_NAME }, (err) => {
    if (err) throw err;

    const createTable=`CREATE TABLE IF NOT EXISTS learners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        language VARCHAR(50) NOT NULL
      )
    `;

    db.query(createTable, (err) => {
      if (err) throw err;
      console.log('Table "learners" is ready');
    });
  });
});

app.post('/add', (req, res) => {
  const { name, language } = req.body;
  db.query('INSERT INTO learners (name, language) VALUES (?, ?)', [name, language], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Learner added', id: result.insertId });
  });
});

app.get('/learners', (req, res) => {
  db.query('SELECT * FROM learners', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get('/learner/:id', (req, res) => {
  const { id }=req.params;
  db.query('SELECT * FROM learners WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length===0) return res.status(404).send({ message: 'Learner not found' });
    res.json(result[0]);
  });
});

app.put('/update/:id', (req, res) => {
  const { id }=req.params;
  const { name, language }=req.body;
  db.query('UPDATE learners SET name = ?, language = ? WHERE id = ?', [name, language, id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows===0) return res.status(404).send({ message: 'Learner not found' });
    res.send({ message: 'Learner updated' });
  });
});

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM learners WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send({ message: 'Learner not found' });
    res.send({ message: 'Learner deleted' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
