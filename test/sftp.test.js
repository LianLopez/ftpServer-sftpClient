"use strict";

const Client = require("ssh2-sftp-client");

const sftp = new Client("test");

// SSH2 CONFIG
const config = {
    host: "qa.vega.lyracons.tk",
    port: 2222,
    username: "naima",
    password: "oCqv6E01HMOWp",
};

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
