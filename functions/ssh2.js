"use strict";

const Client = require("ssh2-sftp-client");
const fs = require("fs");

var sftpGet, sftpSend;
var count = 0;

function filterFiles(files) {
    const pedidos = fs.readdirSync("./files/pedidos");
    let arrayFiles = files.filter((file) => {
        for (let i = 0; i < pedidos.length; i++) {
            if (pedidos[i] == file.name) {
                return false;
            }
        }
        return true;
    });
    return arrayFiles;
}
function getData(config) {
    sftpGet = new Client(`${count}`);
    sftpGet
        .connect(config)
        .then(() => {
            sftpGet.list("/files");
        })
        .then((data) => {
            let files = filterFiles(data);
            files.forEach((file) => {
                let serverPath = "/files/" + file.name;
                let localPath = `./files/pedidos/${file.name}`;
                sftpGet.get(serverPath, localPath);
            });
        })
        .catch((err) => console.log(err));
    count++;
}

function sendData(csvFiles, config) {
    sftpSend = new Client(`${count}`);
    sftpSend
        .connect(config)
        .then(() => {
            for (let i = 0; i < csvFiles.length; i++) {
                const element = csvFiles[i];
                if (i == 0) {
                    sftpSend.put(
                        "./files/processed_files/stock/" + element,
                        `/outbound/processed/${element}`
                    );
                } else {
                    sftpSend.put(
                        "./files/processed_files/prices/" + element,
                        `/inbound/processed/${element}`
                    );
                }
            }
        })
        .catch((err) => {
            console.log(err);
        });
    count++;
}

module.exports = {
    getData: getData,
    sendData: sendData,
};
