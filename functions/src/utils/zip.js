const XLSX = require("xlsx");
const JSZip = require("jszip");

const makeAoA = (size) => {
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
const fillWith = (aoa, data) => {
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
const prepareZipFile = (zip, aoa, headers, formatter) => {
  aoa.forEach((arr, i) => {
    const result = [[...headers]];
    arr.forEach((el) => {
      result.push(formatter(el));
    });

    const filename = `${i + 1}.csv`;
    const ws = XLSX.utils.aoa_to_sheet(result);
    const csv = XLSX.utils.sheet_to_csv(ws, { RS: "\n" });
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
const generateZipFileRoundRobin = async (size, data, headers, formatter) => {
  const aoa = makeAoA(size);

  fillWith(aoa, data);

  const zip = new JSZip();

  prepareZipFile(zip, aoa, headers, formatter);

  const content = await zip.generateAsync({ type: "base64" });
  return { ok: true, title: "report.zip", content };
};

module.exports = {
  makeAoA,
  fillWith,
  prepareZipFile,
  generateZipFileRoundRobin,
};
