const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const { pool, sqlAction } = require('../modules/mysql-conn');
const { clog, alertLoc } = require('../modules/util');

router.get(['/', '/signin'], function (req, res, next) {
    clog(req.session);
    res.render('user-signin.ejs', { session: req.session });
});

router.get('/signup', function (req, res, next) {
    res.render('user-signup.ejs');
});

router.get('/signout', function (req, res, next) {
    if (req.session.email) {
        req.session.destroy((err) => {
            if (err) res.send(err);
            else res.redirect('/');
        });
    }
});

router.post('/signin', async function (req, res, next) {
    let { email, password } = req.body;
    password = crypto.createHash('sha512').update(password + process.env.salt).digest('base64');
    let sql = "SELECT * FROM users WHERE email=?";
    let sqlVals = [email];
    let result = await pool.execute(sql, sqlVals);
    if (result[0][0]) {
        req.session.email = result[0][0].email;
        res.redirect('/');
    } else {
        alertLoc
        res.send(alertLoc('wrong email or password', '/'));
    }
});

router.post('/signup', async function (req, res, next) {
    let { email, password, createdAt = new Date() } = req.body;
    password = crypto.createHash('sha512').update(password + process.env.salt).digest('base64');
    let sql = "INSERT INTO users SET email=?, password=?, createdAt=?";
    let sqlVals = [email, password, createdAt];
    try {
        let result = await pool.execute(sql, sqlVals);
        // res.json(result);
        res.redirect('/');
    } catch (err) {
        res.send(err);
    }
});

module.exports = router;