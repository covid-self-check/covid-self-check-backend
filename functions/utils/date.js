const moment = require("moment");

exports.convertTZ = (date, tzString) => {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
};

/**
 * convert date to MM-DD-YYYY hh:mm:ss format
 * @param {Date} date
 * @returns
 */
exports.formatDateTime = (date) => {
  return moment(date).format("MM-DD-YYYY hh:mm:ss");
};
