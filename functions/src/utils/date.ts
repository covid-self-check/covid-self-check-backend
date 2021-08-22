import * as moment from "moment";
import * as _ from "lodash";
import { admin } from "../init";
import { Patient } from "../types";

enum TZ {
  AsiaBangkok = "Asia/Bangkok"
}


export const convertTZ = (date: Date, tzString: TZ = TZ.AsiaBangkok) => {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
};

export const convertTimestampToStr = (data: Patient) => {
  const tmp: { [key: string]: any } = {};
  for (const [key, value] of _.entries(data)) {
    if (value instanceof admin.firestore.Timestamp) {
      const date = convertTZ(value.toDate(), TZ.AsiaBangkok);
      const dateStr = moment(date).format("DD-MM-YYYY hh:mm:ss");
      tmp[key] = dateStr;
    } else {
      tmp[key] = value
    }
  }
  return tmp;
};

/**
 * convert date to MM-DD-YYYY hh:mm:ss format
 * @param {Date} date
 * @returns
 */
export const formatDateTime = (date: Date) => {
  return moment(date).format("MM-DD-YYYY hh:mm:ss");
};
export const formatDateTimeAPI = (date: Date) => {
  return moment(date).format("YYYY-MM-DD");
};

/**
 *
 * @param {Date} date
 * @returns
 */
export const calculateAge = (date: Date) => {
  const ageDifMs = Date.now() - date.getTime();
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const getDateID = () => {
  const date = convertTZ(new Date(), TZ.AsiaBangkok);
  return moment(date).format("YYYY-MM-DD");
};
