const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { pool } = require('./modules/mysql-conn');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { clog, logClientIP } = require('./modules/util');

// const Sequelize = require('sequelize');

// routers
const indexRouter = require('./router/index');
const usersRouter = require("./router/users");
const postsRouter = require("./router/posts");
const postAPIRouter = require("./router/post-api");

const app = express();
const port = 3000;

app.locals.pretty = true;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// middle ware
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.salt, // salt used for encryption
    resave: false, // forces the session to be saved back to the session store
    saveUninitialized: false, // forces a session that is "uninitialized" to be saved to the store.
    store: new MySQLStore({}, pool)
}));
app.use(logClientIP);
app.use("/static", express.static(path.join(__dirname, './public')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// for post method form data, not for ajax
// not work with enctype='multipart/form-data' because req.body is empty
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}));

/*
app.use(/^(?!\/user).+/, (req, res, next) => {
	console.log("BASE: ", req.baseUrl);
	if(req.session.email) next();
	else res.redirect('/user/login');
});
*/

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/post-api', postAPIRouter);

app.listen(port, () => clog(`http://192.168.0.64:${port}`));