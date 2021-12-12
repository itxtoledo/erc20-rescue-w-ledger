const csv = require("csv-parser");
const fs = require("fs");

module.exports = {
  readCsv: () => {
    const results = [];
    fs.createReadStream("data.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log(results);
      });
  },
};
