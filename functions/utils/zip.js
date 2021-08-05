const XLSX = require("xlsx");
const JSZip = require("jszip");

/**
 * generate multiple csv file and send zip file back to client
 * @param {number} size - number of volunteer
 * @param {data} data - snapshot from firebase (need to convert to array of obj)
 * @param {string[]} headers - array of headers
 * @param {() => any[]} serializer - function that return element of each row
 */
exports.generateZipFileRoundRobin = async (size, data, headers, serializer) => {
  const arrs = new Array(size);

  for (let i = 0; i < size; i++) {
    arrs[i] = [];
  }

  for (let i = 0; i < data.length; i++) {
    arrs[i % size].push(data[i]);
  }

  const zip = new JSZip();
  arrs.forEach((arr, i) => {
    const aoa = [[...headers]];
    arr.forEach((el) => {
      aoa.push(serializer(el));
    });

    const filename = `${i + 1}.csv`;
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const csv = XLSX.utils.sheet_to_csv(ws, { RS: "\n" });
    zip.file(filename, "\ufeff" + csv);
  });

  const content = await zip.generateAsync({ type: "base64" });
  return { ok: true, title: "report.zip", content };
};
