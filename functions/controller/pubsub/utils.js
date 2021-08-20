const moment = require("moment");
const { convertTZ } = require("../../utils");

exports.getDateID = () => {
  const date = convertTZ(new Date(), "Asia/Bangkok");
  return moment(date).format("YYYY-MM-DD");
};
