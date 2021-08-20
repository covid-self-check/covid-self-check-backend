"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx_1 = require("xlsx");
const jszip_1 = require("jszip");
exports.makeAoA = (size) => {
  const aoa = new Array(size);
  for (let i = 0; i < size; i++) {
    aoa[i] = [];
  }
  return aoa;
};
/**
 * fill AOA with data
 * @param {any[][]} aoa
 * @param {any[]} data
 */
exports.fillWith = (aoa, data) => {
  const size = aoa.length;
  for (let i = 0; i < data.length; i++) {
    aoa[i % size].push(data[i]);
  }
};
/**
 * prepare zip file
 * @param {JSZip} zip
 * @param {any[][]} aoa
 * @param {string[]} headers
 * @param {() => any[]} formatter
 * @returns
 */
exports.prepareZipFile = (zip, aoa, headers, formatter) => {
  aoa.forEach((arr, i) => {
    const result = [[...headers]];
    arr.forEach((el) => {
      result.push(formatter(el));
    });
    const filename = `${i + 1}.csv`;
    const ws = xlsx_1.default.utils.aoa_to_sheet(result);
    const csv = xlsx_1.default.utils.sheet_to_csv(ws, { RS: "\n" });
    zip.file(filename, "\ufeff" + csv);
  });
};
/**
 * generate multiple csv file and send zip file back to client
 * @param {number} size - number of volunteer
 * @param {any[]} data - snapshot from firebase (need to convert to array of obj)
 * @param {string[]} headers - array of headers
 * @param {() => any[]} formatter - function that return element of each row
 */
exports.generateZipFileRoundRobin = async (size, data, headers, formatter) => {
  const aoa = this.makeAoA(size);
  this.fillWith(aoa, data);
  const zip = new jszip_1.default();
  this.prepareZipFile(zip, aoa, headers, formatter);
  const content = await zip.generateAsync({ type: "base64" });
  return { ok: true, title: "report.zip", content };
};
//# sourceMappingURL=zip.js.map
