const FtpSvr = require("ftp-srv");
const fs = require("fs");
const xls_csv = require("./functions/xls-csv");
const ssh2 = require("./functions/ssh2");

require("dotenv").config();
const hostname = process.env.HOST;
const port = process.env.PORT;

// SSH2 CONFIG
const config = {
    host: process.env.SSH_HOST,
    port: process.env.SSH_PORT,
    username: process.env.SSH_USER,
    password: process.env.SSH_PASS,
    algorithms: {
        kex: [
            "diffie-hellman-group1-sha1",
            "ecdh-sha2-nistp256",
            "ecdh-sha2-nistp384",
            "ecdh-sha2-nistp521",
            "diffie-hellman-group-exchange-sha256",
            "diffie-hellman-group14-sha1",
        ],
        cipher: [
            "3des-cbc",
            "aes128-ctr",
            "aes192-ctr",
            "aes256-ctr",
            "aes128-gcm",
            "aes128-gcm@openssh.com",
            "aes256-gcm",
            "aes256-gcm@openssh.com",
        ],
        serverHostKey: [
            "ssh-rsa",
            "ecdsa-sha2-nistp256",
            "ecdsa-sha2-nistp384",
            "ecdsa-sha2-nistp521",
        ],
        hmac: ["hmac-sha2-256", "hmac-sha2-512", "hmac-sha1"],
    },
    localAddress: process.env.HOST,
};

// Methods

function createLog(fileName, error = false) {
    const logs = fs.readdirSync("./logs");
    var file = "log-" + xls_csv.fecha() + ".txt";
    logs.forEach((archivo) => {
        for (let j = 0; j < archivo.length; j++) {
            if (archivo == file) {
                file = "log-" + xls_csv.fecha(1) + ".txt";
            }
        }
    });

    if (error) var data = `${fileName} - Fallo el agregar el archivo: ${error}`;
    else {
        var data = `${fileName} - Se agregó exitosamente el archivo`;
        fs.writeFile("./logs/" + file, data, (err) => {
            if (err) console.error(err);
            else {
                console.log("Log creado exitosamente");
                backupFile(fileName);
            }
        });
    }
}

function callback(err) {
    if (err) throw err;
}

function backupFile(fileName) {
    let nombre = fileName;
    let nombreArray = nombre.split("/");
    nombre = "./ftp_files/backup/" + xls_csv.fecha() + "-" + nombreArray.pop();
    fs.copyFile(fileName, nombre, callback);
    var dirNames = xls_csv.processFile(fileName);
    setTimeout(() => ssh2.sendData(dirNames, config), 5000);
}

// FTP Server
const url = `ftp://${hostname}:${port}`;
const ftpServer = new FtpSvr({
    url: url,
    anonymous: false,
});

ftpServer.on("login", (data, resolve, reject) => {
    if (
        data.username == process.env.USER_FTP &&
        data.password == process.env.PASS_FTP
    ) {
        ssh2.getData(config);
        resolve({ root: `./ftp_files` });
        data.connection.on("STOR", (error, fileName) => {
            if (error) {
                console.error(
                    `FTP server error: could not receive file ${fileName} for upload ${error}`
                );
                let name = fileName;
                name = name.split(".");
                nameReversed = name.reverse();
                if (nameReversed[0] == "xls" || nameReversed[0] == "xlsx") {
                    createLog(fileName, error);
                }
            } else {
                console.info(
                    `FTP server: upload successfully received - ${fileName}`
                );
                createLog(fileName);
            }
        });
        console.log("Conexion establecida");
    } else {
        reject(
            new Error(
                "Imposible autenticar con el servidor FTP: Usuario y contraseña incorrectos"
            )
        );
    }
});

ftpServer.on("client-error", (connection, context, error) => {
    console.log("connection: " + connection);
    console.log("context: " + context);
    console.log("error: " + error);
});

ftpServer.listen().then(() => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
