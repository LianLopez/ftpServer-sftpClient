const csv = require("@fast-csv/parse");
const xlsx = require("node-xlsx");
const fs = require("fs");

function csvParse(url) {
    let data = [];
    csv.parseFile(url)
        .on("error", (error) => console.error(error))
        .on("data", (row) => data.push(row))
        .on("end", () => console.log(data));
    return data;
}

function csvToXls(file) {
    let src = `./ftp_files/orders/pending/${file}`;
    let dataParsed = csvParse(src);
    let buffer = xlsx.build([{ name: "pedidos", data: dataParsed }]);
    let fileName = file;
    fileName = fileName.split(".");
    fileName.pop();
    fileName = fileName.join();
    fs.writeFile(
        `./ftp_files/orders/processed/${fileName}.xlsx`,
        buffer,
        (err) => {
            if (err) return console.error(err);
            console.log(`${file} Creado exitosamente csvToXls`);
        }
    );
    fs.unlink(src, (err) => {
        if (err) throw err;
        console.log(`${file} was deleted`);
    });
}

module.exports = {
    csvToXls: csvToXls,
};
