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

function csvToXls(files) {
    setTimeout(() => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let src = `./files/pedidos/original/${file.name}`;
            let dataParsed = csvParse(src);
            setTimeout(() => {
                let buffer = xlsx.build([{ name: "pedidos", data: dataParsed }]);
                fs.writeFile(
                    `./files/pedidos/excel/${file.name}.xlsx`,
                    buffer,
                    (err) => {
                        if (err) return console.error(err);
                        console.log(`${file.name} Creado exitosamente`);
                    }
                );
            }, 2000)
        }
    }, 3000)
}


module.exports = {
    csvToXls: csvToXls
}
