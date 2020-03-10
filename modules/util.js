const path = require('path');
const fs = require('fs');

const clog = console.log;
function logClientIP(req, res, next) {
    clog(`${Math.ceil(Math.random() * 100) + 100} req.ip ${req.connection.remoteAddress}`);
    next();
}

function alertLoc(msg, loc) {
    return `<script>
	alert("${msg}");
	location.href="${loc}";
	</script>`;
}

const getURL = filename => `/uploads/${filename.split("-")[0]}/${filename}`;
const getPath = filename => path.join(__dirname, `../uploads/${filename.split("-")[0]}/${filename}`);

function unLink(filename) {
    let filePath = getPath(filename);
    try {
        if (fs.existsSync(filePath) && !fs.unlinkSync(filePath)) return true;
        return false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = { clog, logClientIP, alertLoc, getURL, getPath, unLink };