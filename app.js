const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const { clog, logClientIP } = require('./modules/util');

// const Sequelize = require('sequelize');

const app = express();
const port = 3000;

app.locals.pretty = true;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// middle ware
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // ??
app.use(logClientIP);
app.use("/static", express.static(path.join(__dirname, './public')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// for post method form data, not for ajax
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}));

// router
const postsRouter = require(path.join(__dirname, "./router/posts"));
const postAPIRouter = require(path.join(__dirname, "./router/post-api"));
app.use('/posts', postsRouter);
app.use('/post-api', postAPIRouter);

// route
app.get("/", (req, res) => {
    // res.send("<h1>Hello world</h1>"); // send is req's method of express' app
    // res.json({ say: "hello" });
    // res.sendFile(path.join(__dirname, "public/index.html")); // absolute path of file
    // url must have '/'
    let vals = { name: 'ejs' };
    res.render("index.ejs", vals);
});

app.listen(port, () => clog(`http://192.168.0.64:${port}`));