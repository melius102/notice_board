const express = require("express");
const dateTime = require('date-time');
const path = require('path');
const { pool, sqlAction } = require('../modules/mysql-conn');
const { upload } = require('../modules/multer-conn');
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
        // result[0] = result[0].map(v => { v.createdAt = dateTime({ date: v.createdAt }); return v; });
        for (let v of result[0]) {
            v.createdAt = dateTime({ date: v.createdAt });
            sql = 'SELECT * FROM files WHERE postid=?'; // get number of files
            sqlVals = [v.id];
            let files = await sqlAction(pool, sql, sqlVals);
            v.filenum = files[0].length;
        }
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
        let v = result[0][0]; // one data
        v.createdAt = dateTime({ date: v.createdAt });
        sql = 'SELECT * FROM files WHERE postid=?'; // get number of files
        sqlVals = [v.id];
        let filesData = await sqlAction(pool, sql, sqlVals);
        let files = filesData[0];
        v.filenum = files.length;
        if (v.filenum > 0) {
            let file = files[0];
            v.fileId = file.id;
            v.originalname = file.originalname;
            let filenameArr = file.filename.split('-');
            v.filepath = `/uploads/${filenameArr[0]}/${file.filename}`;
            let img = ['.jpg', '.jpeg', '.gif', '.png'];
            let ext = path.extname(file.filename).toLowerCase();
            if (img.indexOf(ext) > -1) v.filetype = "img";
        }
        // res.json(result[0]);
        res.render("post.ejs", { res: v });
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
// upload.any()
// upload.single(fieldname) : fieldname of formdata
router.post("/", upload.single("upfile"), async (req, res) => {
    let contentType = req.headers['content-type'].split(';')[0];
    clog('contentType', contentType);
    let { writer, title, content } = req.body;
    let sql, sqlVals, result;
    try {
        // sql = 'INSERT INTO users SET id=?, data=?, createdAt=now()';
        sql = 'INSERT INTO posts SET writer=?, title=?, content=?, createdAt=?';
        sqlVals = [writer, title, content, new Date()];
        result = await sqlAction(pool, sql, sqlVals);
        if (contentType == 'application/x-www-form-urlencoded') { // formdata without enctype
        } else if (contentType == 'multipart/form-data') { // formdata with enctype='multipart/form-data'
            let file = req.file;
            if (file) {
                // need to improve, insert and select must be performed simultaneously.
                sql = 'SELECT id FROM posts ORDER BY id DESC LIMIT 1';
                sqlVals = [];
                result = await sqlAction(pool, sql, sqlVals);
                let postid = result[0][0].id

                sql = 'INSERT INTO files SET postid=?, filename=?, originalname=?';
                sqlVals = [postid, file.filename, file.originalname];
                result = await sqlAction(pool, sql, sqlVals);
            }
        }
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

// DOWNLOAD
router.get("/download/:id", async (req, res) => {
    let sql = "SELECT *  FROM files WHERE id=?";
    let sqlVals = [req.params.id];
    const result = await sqlAction(pool, sql, sqlVals);
    let { originalname, filename } = result[0][0];
    let filenameArr = filename.split('-');
    let filepath = path.join(__dirname, `../uploads/${filenameArr[0]}/${filename}`);
    res.download(filepath, originalname);
});

module.exports = router;
