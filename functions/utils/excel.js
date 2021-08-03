const XLSX = require("xlsx");

exports.exportToExcel = (data) => {
  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, "รายงานสถานะ");

  return wb;
};
