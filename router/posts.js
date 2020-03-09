const express = require("express");
const dateTime = require('date-time');
const { pool, sqlAction } = require('../modules/mysql-conn');
const { clog } = require('../modules/util');

const router = express.Router();

// VIEW ALL
router.get(["/", "/select"], async (req, res) => { // promise version
    try { // for asyn-await
        // let sql = 'INSERT INTO board SET title=?, writer=?, wdate=?';
        // let sql = "SELECT * FROM board WHERE id=" + id;
        // let sql = "SELECT * FROM board ORDER BY id DESC";
        // let sqlVals = ["test", "dev", "2020-01-05 15:55:00"];
        // let sqlVals = [req.body.title, req.body.writer, new Date(), req.body.content];
        let sql = 'SELECT * FROM posts ORDER BY id DESC';
        let sqlVals = [];
        const result = await sqlAction(pool, sql, sqlVals);
        result[0] = result[0].map(v => {
            v.createdAt = dateTime({ date: v.createdAt });
            return v;
        });
        // res.json(result[0]);
        res.render("posts.ejs", { res: result[0] });
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// VIEW ONE
router.get("/select/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let sql = 'SELECT * FROM posts WHERE id=?';
        let sqlVals = [id];
        const result = await sqlAction(pool, sql, sqlVals);
        result[0] = result[0].map(v => {
            v.createdAt = dateTime({ date: v.createdAt });
            return v;
        });
        // res.json(result[0]);
        res.render("post.ejs", { res: result[0][0] });
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// VIEW CREATE
router.get("/insert", async (req, res) => {
    res.render("post-insert.ejs");
});


// VIEW UPDATE
router.get("/update/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let sql = 'SELECT * FROM posts WHERE id=?';
        let sqlVals = [id];
        const result = await sqlAction(pool, sql, sqlVals);
        // res.json(result[0]);
        res.render("post-update.ejs", { res: result[0][0] });
    } catch (err) {
        clog(err);
        res.send(err);
    }
});


// DELETE
router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let sql = "DELETE FROM posts WHERE id=?";
        let sqlVals = [id];
        const result = await sqlAction(pool, sql, sqlVals);
        res.redirect('/posts');
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// CREATE
router.post("/", async (req, res) => {
    let { writer, title, content } = req.body;
    try {
        // let sql = 'INSERT INTO users SET id=?, data=?, createdAt=now()';
        let sql = 'INSERT INTO posts SET writer=?, title=?, content=?, createdAt=?';
        let sqlVals = [writer, title, content, new Date()];
        const result = await sqlAction(pool, sql, sqlVals);
        // res.json(result[0]);
        res.redirect('/posts');
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// UPDATE
router.put("/", async (req, res) => {
    let { writer, title, content, id } = req.body;
    try {
        let sql = "UPDATE posts SET writer=?, title=?, content=?, updatedAt=? WHERE id =?";
        let sqlVals = [writer, title, content, new Date(), id];
        const result = await sqlAction(pool, sql, sqlVals);
        // res.json(result[0]);
        res.redirect('/posts');
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// router.delete("/");

module.exports = router;
