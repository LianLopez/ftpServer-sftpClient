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
                        sftpMove
                            .delete(`/orders/pending/${element}`)
                            .then(() => {
                                console.log(
                                    `Archivo borrado correctamente ${element}`
                                );
                                csvToXls(element);
                            })
                            .catch((err) => console.error(err));
                    })
                    .catch((err) => console.log(err));
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
            if (data.length > 0) {
                console.log(`existen archivos del SFTP a importar`);
                let files = filterFiles(data);
                console.log(`archivos filtrados del SFTP ${files.length}`);
                files.forEach((file) => {
                    let serverPath = "/orders/pending/" + file.name;
                    let localPath = `./ftp_files/orders/pending/${file.name}`;
                    arrSrc.push(file.name);
                    return sftpGet.get(serverPath, localPath);
                });
                if (arrSrc.length > 0) {
                    console.log(`lista de archivos bajados ${arrSrc.length}`);
                    for (let i = 0; i < arrSrc.length; i++) {
                        const element = arrSrc[i];
                        console.log(element);
                    }
                    moveFiles(arrSrc, config);
                }
            } else {
                console.log("No hay archivos por procesar");
            }
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
                    sftpSend
                        .put(
                            "./ftp_files/processed_files/stock/" + element,
                            `/stock/pending/${element}`
                        )
                        .then(() => {
                            console.log(
                                `${element} se subio correctamente a VEGA`
                            );
                        });
                } else {
                    sftpSend
                        .put(
                            "./ftp_files/processed_files/prices/" + element,
                            `/price/pending/${element}`
                        )
                        .then(() => {
                            console.log(
                                `${element} se subio correctamente a VEGA`
                            );
                        });
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
