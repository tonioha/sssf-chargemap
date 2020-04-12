const https = require('https');
const http = require('http');
const fs = require('fs');
const sslkey = fs.readFileSync('./certs/ssl-key.pem');
const sslcert = fs.readFileSync('./certs/ssl-cert.pem')

const options = {
    key: sslkey,
    cert: sslcert
};

module.exports = (app) => {
    https.createServer(options, app).listen(process.env.HTTPS_PORT);
    http.createServer((req, res) => {
       res.writeHead(301, {'Location': `https://localhost:${process.env.HTTPS_PORT}${req.url}`});
       res.end();
    }).listen(process.env.HTTP_PORT);
};