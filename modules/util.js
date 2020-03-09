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

module.exports = { clog, logClientIP, alertLoc };