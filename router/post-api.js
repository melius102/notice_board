const express = require('express');
const dateTime = require('date-time');
const router = express.Router();
const { pool, sqlAction } = require('../modules/mysql-conn');
const { clog } = require('../modules/util');

// REST API
// POST:   CREATE
// GET:    READ
// PUT:    UPDATE
// DELETE: DELETE

// VIEW
router.get('/', (req, res) => {
    res.render("post-api-posts.ejs");
});

// GET: READ
router.get(['/api', '/api/:id'], async (req, res) => {
    let id = req.params.id;
    try {
        let sql, sqlVals;
        if (id) { // read one
            sql = 'SELECT * FROM posts WHERE id=?';
            sqlVals = [id];
        } else { // read all
            sql = 'SELECT * FROM posts ORDER BY id DESC';
            sqlVals = [];
        }
        const result = await sqlAction(pool, sql, sqlVals);
        result[0] = result[0].map(v => {
            v.createdAt = dateTime({ date: v.createdAt });
            return v;
        });
        // clog(result[0]);
        res.json(result[0]);
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// POST: CREATE
router.post("/api", async (req, res) => {
    let writer = req.body.writer;
    let title = req.body.title;
    let content = req.body.content;
    let sql = 'INSERT INTO posts SET writer=?, title=?, content=?, createdAt=?';
    let sqlVals = [writer, title, content, new Date()];
    try {
        const result = await sqlAction(pool, sql, sqlVals);
        res.json(result[0]);
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// PUT: UPDATE
router.put("/api", async (req, res) => {
    clog('put', req.body.id);
    let id = req.body.id;
    let writer = req.body.writer;
    let title = req.body.title;
    let content = req.body.content;
    let sql = "UPDATE posts SET writer=?, title=?, content=?, updatedAt=? WHERE id =?";
    let sqlVals = [writer, title, content, new Date(), id];
    try {
        const result = await sqlAction(pool, sql, sqlVals);
        res.json(result[0]);
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// DELETE: DELETE
router.delete("/api", async (req, res) => {
    clog(req.body.id);
    let sql = "DELETE FROM posts WHERE id=?";
    let sqlVals = [req.body.id];
    try {
        const result = await sqlAction(pool, sql, sqlVals);
        res.json(result[0]);
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

module.exports = router;