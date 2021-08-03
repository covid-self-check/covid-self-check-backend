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

/**
 *
 * @param {Date} date
 * @returns
 */
exports.calculateAge = (date) => {
  var ageDifMs = Date.now() - date.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};
