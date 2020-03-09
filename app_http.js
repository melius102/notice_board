const http = require('http');
const { clog } = require('./modules/util');
const host = '192.168.0.64';
const port = 3000;

const server = http.createServer((req, res) => {
    clog('req.ip:', req.connection.remoteAddress);
    // res.setHeader('Content-type', 'text/plain'); // output as plain text rather than html tag
    res.setHeader('Content-type', 'text/html');
    res.write('<h2>Hello</h2>');
    res.end('<h2>http</h2>');
});

server.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
});