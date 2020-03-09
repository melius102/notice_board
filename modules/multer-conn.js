const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { clog } = require('./util');

// https://www.npmjs.com/package/multer

//////////
// storage
const storage = multer.diskStorage({ destination, filename });

// destination
function destination(req, file, cb) {
    clog('destination');
    cb(null, getPath());
}

function getPath() {
    let newPath = path.join(__dirname, "../uploads/" + makePath());
    if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
    return newPath;
}

function makePath() {
    let d = new Date();
    let year = d.getFullYear(); // 2020
    let month = d.getMonth(); // 0 ~ 11
    return String(year).substr(2) + zp(month + 1);
}

function zp(d) { return d < 10 ? "0" + d : d }

// filename
function filename(req, file, cb) {
    cb(null, getFile(file.originalname).newFile);
    // file.fieldname, filename, originalname ...
}

function getFile(oriFile) {
    let ext = path.extname(oriFile);
    let name = path.basename(oriFile, ext);
    let f1 = makePath();
    let f2 = Date.now();
    let f3 = Math.floor(Math.random() * 90) + 10; // 10 ~ 99
    return {
        newFile: f1 + '-' + f2 + '-' + f3 + ext,
        newExt: ext,
        newName: f1 + '-' + f2 + '-' + f3
    };
}

/////////
// multer
const upload = multer({ storage, fileFilter });

function fileFilter(req, file, cb) {
    let allowExt = ['.jpg', '.jpeg', '.gif', '.png', '.zip', '.txt', '.pdf'];
    let ext = path.extname(file.originalname).toLocaleLowerCase();
    if (allowExt.indexOf(ext) > -1) {
        req.fileUploadChk = true;
        cb(null, true); // error, result
    } else {
        req.fileUploadChk = false;
        cb(null, false);
    }
}

module.exports = { upload };