"use strict";
const http = require("http");
const Client = require("ssh2-sftp-client");

const sftp = new Client("test");
require("dotenv").config();

// SSH2 CONFIG
const config = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASS,
};

const host = "localhost";
const port = 8000;

const requestListener = function (req, res) {};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    sftp.connect(config)
        .then(() => {
            return sftp.list("/");
        })
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            console.error(err);
        });
});
