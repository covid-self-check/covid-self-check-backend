const XLSX = require("xlsx");
const JSZip = require("jszip");
const fs = require("fs");

/**
 * generate multiple csv file and send zip file back to client
 * @param {Express.Response} res
 * @param {number} size - number of volunteer
 * @param {data} data - snapshot from firebase (need to convert to array of obj)
 */
const generateZipFile = (res, size, data) => {
  const arrs = _.chunk(data, size);

  const zip = new JSZip();

  arrs.forEach((arr, i) => {
    const aoa = convertToAoA(arr);
    const filename = `${i + 1}.csv`;
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const csv = XLSX.utils.sheet_to_csv(ws, { RS: "\n" });
    zip.file(filename, csv);
  });

  zip
    .generateAsync({ type: "base64" })
    .then(function (content) {
      res.json({
        title: "report.zip",
        content: content,
      });
    })
    .catch((err) => {
      res.json({
        err,
      });
    });
};

/**
 * generate multiple csv file and send zip file back to client
 * @param {number} size - number of volunteer
 * @param {data} data - snapshot from firebase (need to convert to array of obj)
 */
exports.generateZipFileRoundRobin = async (size, data) => {
  var arrs = new Array(size);
  const header = [
    "internal id",
    "first name",
    "call status",
    "tel",
  ];

  for (let i = 0; i < size; i++) {
    arrs[i] = [];
  }

  for (let i = 0; i < data.length; i++) {
    arrs[i % size].push(data[i]);
  }

  const zip = new JSZip();
  arrs.forEach((arr, i) => {
    const aoa = [[...header]];
    arr.forEach((data) => {
      aoa.push([
        data.id,
        data.firstName,
        data.hasCalled,
        `="${data.personalPhoneNo}"`,
      ]);
    });

    const filename = `${i + 1}.csv`;
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const csv = XLSX.utils.sheet_to_csv(ws, { RS: "\n" });
    if (i === 0) {
      var output_file_name = "out.csv";
      var stream = XLSX.stream.to_csv(ws);
      stream.pipe(fs.createWriteStream(output_file_name));
    }
    zip.file(filename, "\ufeff" + csv);
  });

  const content = await zip.generateAsync({ type: "base64" });
  return { ok: true, title: "report.zip", content };
};
