const express = require("express");
const dateTime = require('date-time');
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');
const { pool, sqlAction } = require('../modules/mysql-conn');
const { upload } = require('../modules/multer-conn');
const { clog, getURL, getPath, unLink } = require('../modules/util');

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
        // const result = await sqlAction(pool, sql, sqlVals);
        const result = await pool.execute(sql, sqlVals);
        // result[0] = result[0].map(v => { v.createdAt = dateTime({ date: v.createdAt }); return v; });
        for (let v of result[0]) {
            v.createdAt = dateTime({ date: v.createdAt });

            // files
            sql = 'SELECT * FROM files WHERE postid=?'; // get number of files
            sqlVals = [v.id];
            const subRes = await pool.execute(sql, sqlVals);
            let files = subRes[0];
            v.filenum = files.length;
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
        const result = await pool.execute(sql, sqlVals);
        let v = result[0][0]; // one data
        v.createdAt = dateTime({ date: v.createdAt });
        sql = 'SELECT * FROM files WHERE postid=?'; // get number of files
        sqlVals = [v.id];
        const subRed = await pool.execute(sql, sqlVals);
        let files = subRed[0];
        v.filenum = files.length;

        // file
        if (v.filenum > 0) {
            let file = files[0]; // first file
            v.fileId = file.id;
            v.originalname = file.originalname;
            v.fileurl = getURL(file.filename);

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
        const result = await pool.execute(sql, sqlVals);
        let v = result[0][0]; // one data
        v.createdAt = dateTime({ date: v.createdAt });
        sql = 'SELECT * FROM files WHERE postid=?'; // get number of files
        sqlVals = [v.id];
        const subRed = await pool.execute(sql, sqlVals);
        let files = subRed[0];
        v.filenum = files.length;

        // file
        if (v.filenum > 0) {
            let file = files[0]; // first file
            v.fileId = file.id;
            v.originalname = file.originalname;
            v.fileurl = getURL(file.filename);

            let img = ['.jpg', '.jpeg', '.gif', '.png'];
            let ext = path.extname(file.filename).toLowerCase();
            if (img.indexOf(ext) > -1) v.filetype = "img";
        }
        // res.json(result[0]);
        res.render("post-update.ejs", { res: v });
    } catch (err) {
        clog(err);
        res.send(err);
    }
});


// DELETE
router.get("/delete/:id", async (req, res) => {
    let id = req.params.id;
    try {
        let sql = 'SELECT * FROM files WHERE postid=?';
        let sqlVals = [id];
        let result = await pool.execute(sql, sqlVals);
        let files = result[0];
        if (files.length > 0) {
            let file = files[0]; // first file
            if (unLink(file.filename)) {
                clog('success to remove file');
                sql = "DELETE FROM files WHERE id=?";
                sqlVals = [file.id];
                result = await pool.execute(sql, sqlVals);
            } else {
                clog('fail to remove file');
                res.jon({ error: 'fail to remove file' });
                return;
            }
        }
        sql = "DELETE FROM posts WHERE id=?";
        sqlVals = [id];
        result = await pool.execute(sql, sqlVals);
        res.redirect('/posts');
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// CREATE
// upload.any()
// upload.single(fieldname) : fieldname of formdata
router.post("/post", upload.single("upfile"), async (req, res) => {
    clog('post', req.body);
    let contentType = req.headers['content-type'].split(';')[0];
    clog('contentType', contentType);
    let { writer, title, content } = req.body;
    let sql, sqlVals, result;
    try {
        // sql = 'INSERT INTO users SET id=?, data=?, createdAt=now()';
        sql = 'INSERT INTO posts SET writer=?, title=?, content=?, createdAt=?';
        sqlVals = [writer, title, content, new Date()];
        result = await pool.execute(sql, sqlVals);
        if (contentType == 'application/x-www-form-urlencoded') { // formdata without enctype
        } else if (contentType == 'multipart/form-data') { // formdata with enctype='multipart/form-data'

            // file
            let file = req.file;
            if (file) {
                // need to improve, insert and select must be performed simultaneously.
                sql = 'SELECT id FROM posts ORDER BY id DESC LIMIT 1';
                sqlVals = [];
                result = await pool.execute(sql, sqlVals);
                let postid = result[0][0].id

                sql = 'INSERT INTO files SET postid=?, filename=?, originalname=?';
                sqlVals = [postid, file.filename, file.originalname];
                result = await pool.execute(sql, sqlVals);
            }
        }
        res.redirect('/posts');
    } catch (err) {
        clog(err);
        res.send(err);
    }
});

// UPDATE
// router.all('/put', upload.single("upfile"), methodOverride((req, res, next) => {
//     clog(req.body);
//     if (req.body && typeof req.body === 'object' && '_method' in req.body) {
//         // look in urlencoded POST bodies and delete it
//         let method = req.body._method
//         delete req.body._method
//         return method
//     }
// }), (req, res, next) => {
//     clog('all put');
//     next('route');
// });

router.post("/put", upload.single("upfile"), async (req, res) => {
    clog('put');
    let { writer, title, content, id } = req.body;
    let sql, sqlVals, result;
    try {
        sql = "UPDATE posts SET writer=?, title=?, content=?, updatedAt=? WHERE id =?";
        sqlVals = [writer, title, content, new Date(), id];
        result = await pool.execute(sql, sqlVals);

        let file = req.file;
        if (file) {
            // remove previous file
            sql = "SELECT *  FROM files WHERE postid=?";
            sqlVals = [id];
            let subRed = await pool.execute(sql, sqlVals);
            let files = subRed[0];
            let filenum = files.length;

            if (filenum > 0) { // file exist
                let file = files[0]; // first file
                if (unLink(file.filename)) {
                    clog('success to remove file');
                    sql = "DELETE FROM files WHERE id=?";
                    sqlVals = [file.id];
                    subRed = await pool.execute(sql, sqlVals);
                } else {
                    clog('fail to remove file');
                    res.jon({ error: 'fail to remove file' });
                    return;
                }
            }
            sql = 'INSERT INTO files SET postid=?, filename=?, originalname=?';
            sqlVals = [id, file.filename, file.originalname];
            result = await pool.execute(sql, sqlVals);
        }
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

// REMOVE
router.get("/remove", async (req, res) => {
    let { fileId, fileurl } = req.query;
    fs.unlink(path.join(__dirname, '..' + fileurl), async (err) => {
        clog(path.join(__dirname, '..' + fileurl));
        if (err) res.json({ code: 500 });
        else {
            let sql = "DELETE FROM files WHERE id=?";
            let sqlVals = [fileId];
            let result = await pool.execute(sql, sqlVals);
            res.json({ code: 200 });
        }
    });
});

module.exports = router;
