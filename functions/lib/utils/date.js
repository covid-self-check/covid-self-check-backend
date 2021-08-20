"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = require("moment");
const init_1 = require("../init");
exports.convertTZ = (date, tzString) => {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
};
exports.convertTimestampToStr = (data) => {
  const tmp = Object.assign({}, data);
  for (const key in data) {
    if (data[key] instanceof init_1.admin.firestore.Timestamp) {
      console.log(key, " before convert: ", data[key].toDate());
      const date = this.convertTZ(data[key].toDate(), "Asia/Bangkok");
      console.log(key, " after convert: ", date);
      const dateStr = moment_1.default(date).format("DD-MM-YYYY hh:mm:ss");
      tmp[key] = dateStr;
    }
  }
  return tmp;
};
/**
 * convert date to MM-DD-YYYY hh:mm:ss format
 * @param {Date} date
 * @returns
 */
exports.formatDateTime = (date) => {
  return moment_1.default(date).format("MM-DD-YYYY hh:mm:ss");
};
exports.formatDateTimeAPI = (date) => {
  return moment_1.default(date).format("YYYY-MM-DD");
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
//# sourceMappingURL=date.js.map
