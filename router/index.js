const express = require("express");
const router = express.Router();
const { clog } = require('../modules/util');

router.get("/", (req, res) => {
    // res.send("<h1>Hello world</h1>"); // send is req's method of express' app
    // res.json({ say: "hello" });
    // res.sendFile(path.join(__dirname, "public/index.html")); // absolute path of file
    // url must have '/'
    let vals = { name: 'ejs' };
    res.render("index.ejs", vals);
});

module.exports = router;