import * as moment from "moment";
import { admin } from "../init";
import { Patient } from "../types";

enum TimeZone {
  AsiaBangkok = "Asia/Bangkok"
}

export const convertTZ = (date: Date, tzString: TimeZone) => {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
};

export const convertTimestampToStr = (data: Patient) => {
  const tmp: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof admin.firestore.Timestamp) {
      const date = convertTZ(value.toDate(), TimeZone.AsiaBangkok);
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
 */
export const formatDateTime = (date: Date) => {
  return moment(date).format("MM-DD-YYYY hh:mm:ss");
};
export const formatDateTimeAPI = (date: Date) => {
  return moment(date).format("YYYY-MM-DD");
};


export const calculateAge = (date: Date) => {
  var ageDifMs = Date.now() - date.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const getDateID = () => {
  const date = convertTZ(new Date(), TimeZone.AsiaBangkok);
  return moment(date).format("YYYY-MM-DD");
};
