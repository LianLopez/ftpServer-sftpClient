const xlsx = require("node-xlsx");
const fs = require("fs");
var archivoActual;

function crearNombreArchivo(num = 0) {
    var stock = "stock-" + fecha(num) + ".csv";
    var price = "price-" + fecha(num) + ".csv";
    var nombres = [stock, price];
    return nombres;
}

function fecha(num = 0) {
    var date = new Date();
    var segundos = parseInt(date.getSeconds()) + num;
    var minutos = date.getMinutes();
    var horas = date.getHours();
    var dia = date.getDate();
    var mes = parseInt(date.getMonth()) + 1;
    var ano = date.getFullYear();
    segundos < 10 ? (segundos = "0" + segundos) : true;
    minutos < 10 ? (minutos = "0" + minutos) : true;
    horas < 10 ? (horas = "0" + horas) : true;
    dia < 10 ? (dia = "0" + dia) : true;
    mes < 10 ? (mes = "0" + mes) : true;
    var dateFormated = "" + ano + mes + dia + horas + minutos + segundos;
    return dateFormated;
}

function createStock(rows) {
    let writeStr = "";
    for (var i = 0; i < rows.length; i++) {
        var rowsFormated = rows[i].map((element) => {
            return element;
        });
        rowsFormated.push("1_1");
        rowsFormated.splice(1, 1);
        writeStr += rowsFormated.join(",") + "\n";
    }
    return writeStr;
}
function createPrices(rows) {
    let writeStr = "";
    for (var i = 0; i < rows.length; i++) {
        var rowsFormated = rows[i].map((element) => {
            return element;
        });
        rowsFormated.push(rowsFormated[1]);
        rowsFormated.splice(2, 1);
        writeStr += rowsFormated.join(",") + "\n";
    }
    return writeStr;
}

function createCsv(nombre, data, tipo) {
    fs.writeFile("./files/processed_files/" + tipo + nombre, data, function (
        err
    ) {
        if (err) {
            return console.log(err);
        }
        console.log(`${nombre} was saved in the current directory!`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(nombre);
            }, 2000);
        });
    });
}

//writes to a file, but you will presumably send the csv as a
//response instead

function createFile(data) {
    const filesStock = fs.readdirSync("./files/processed_files/stock");
    const filesPrice = fs.readdirSync("./files/processed_files/prices");
    archivoActual = crearNombreArchivo();
    filesStock.forEach((archivo) => {
        for (let j = 0; j < archivo.length; j++) {
            if (archivo == archivoActual[0]) {
                archivoActual = crearNombreArchivo(1);
            }
        }
    });
    filesPrice.forEach((archivo) => {
        for (let j = 0; j < archivo.length; j++) {
            if (archivo == archivoActual[1]) {
                archivoActual = crearNombreArchivo(1);
            }
        }
    });
    createCsv(archivoActual[0], data.stock, "stock/");
    createCsv(archivoActual[1], data.price, "prices/");
    return archivoActual;
}
function callback(err) {
    if (err) throw err;
}
function processFile(src) {
    let rows = [];
    let obj = xlsx.parse(src); // parses a file
    for (let i = 0; i < obj.length; i++) {
        let sheet = obj[i];
        //loop through all rows in the sheet
        for (let j = 1; j < sheet["data"].length; j++) {
            //add the row to the rows array
            let row = sheet["data"][j];
            row.splice(1, 1);
            if (row[2] < 0) row[2] = 0;
            rows.push(row);
        }
        let objectString = {
            stock: createStock(rows),
            price: createPrices(rows),
        };
        var dirFiles = createFile(objectString);
    }
    fs.unlink(src, callback);
    return dirFiles;
}

module.exports = {
    processFile: processFile,
    fecha: fecha,
};
