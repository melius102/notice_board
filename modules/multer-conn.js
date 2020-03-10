const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { clog } = require('./util');

// https://www.npmjs.com/package/multer

//////////
// storage
const storage = multer.diskStorage({ destination, filename });

// destination
function destination(req, file, cb) {
    cb(null, getPath());
}

function getPath() {
    const uploadPath = path.join(__dirname, '../uploads/' + moment(new Date()).format('YYMMDD'));
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    return uploadPath;
}

// filename
function filename(req, file, cb) {
    cb(null, getFile(file.originalname));
    // file.fieldname, filename, originalname ...
}

function getFile(originalname) {
    let ext = path.extname(originalname);
    let name = path.basename(originalname, ext);
    let rnd = Math.floor(Math.random() * 90) + 10; // 10 ~ 99
    return moment(new Date()).format('YYMMDD') + '-' + Date.now() + '-' + rnd + ext;
}

/////////
// multer
const upload = multer({ storage, fileFilter });

function fileFilter(req, file, cb) {
    let allowExt = ['.jpg', '.jpeg', '.gif', '.png', '.zip', '.txt', '.pdf', '.hwp'];
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