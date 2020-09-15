"use strict";

const Client = require("ssh2-sftp-client");
const fs = require("fs");
const { csvToXls } = require("./csv");

var sftpGet, sftpSend, sftpMove;
var count = 0;

function filterFiles(files) {
    const pedidos = fs.readdirSync("./ftp_files/orders/pending");
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

let moveFiles = (files, config) => {
    sftpMove = new Client(`${count}`);
    sftpMove
        .connect(config)
        .then(() => {
            for (let i = 0; i < files.length; i++) {
                const element = files[i];
                sftpMove
                    .put(
                        "./ftp_files/orders/pending/" + element,
                        `/orders/processed/${element}`
                    )
                    .then(() => {
                        console.log(`Archivo enviado correctamente ${element}`);
                    })
                    .catch((err) => console.log(err));
            }
        })
        .then(() => {
            for (let i = 0; i < files.length; i++) {
                const element = files[i];
                sftpMove
                    .delete(`/orders/pending/${element}`)
                    .then(() => {
                        console.log(`Archivo borrado correctamente ${element}`);
                        csvToXls(element);
                    })
                    .catch((err) => console.error(err));
            }
        })
        .catch((err) => {
            console.log(err);
        });
    count++;
};

function getData(config) {
    let arrSrc = [];
    sftpGet = new Client(`${count}`);
    sftpGet
        .connect(config)
        .then(() => {
            return sftpGet.list("/orders/pending");
        })
        .then((data) => {
            console.log(data);
            let files = filterFiles(data);
            console.log(`archivos filtrados del SFTP ${files}`);
            files.forEach((file) => {
                let serverPath = "/orders/pending/" + file.name;
                let localPath = `./ftp_files/orders/pending/${file.name}`;
                arrSrc.push(file.name);
                return sftpGet.get(serverPath, localPath);
            });
            console.log(arrSrc);
            if (arrSrc.length > 0) moveFiles(arrSrc, config);
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
                        "./ftp_files/processed_files/stock/" + element,
                        `/orders/pending/${element}`
                    );
                } else {
                    sftpSend.put(
                        "./ftp_files/processed_files/prices/" + element,
                        `/orders/pending/${element}`
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
    getData,
    sendData,
    moveFiles,
};
