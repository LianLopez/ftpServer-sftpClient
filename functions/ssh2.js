"use strict";

const Client = require("ssh2-sftp-client");
const fs = require("fs");
let arrSrc = [];

var sftpGet, sftpSend;
var count = 0;


function filterFiles(files) {
    const pedidos = fs.readdirSync("./files/pedidos/original");
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
    arrSrc = [];
    sftpGet = new Client(`${count}`);
    sftpGet
        .connect(config)
        .then(() => {
            return sftpGet.list("/files");
        })
        .then((data) => {
            console.log(data);
            let files = filterFiles(data);
            files.forEach((file) => {
                let serverPath = "/files/" + file.name;
                let localPath = `./files/pedidos/original/${file.name}`;
                arrSrc.push(file)
                return sftpGet.get(serverPath, localPath);
            });
        })
        .catch((err) => console.log(err));
    count++;
    return arrSrc;
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
