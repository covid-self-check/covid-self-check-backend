const { convertTZ } = require("./date");
const moment = require("moment-timezone");

describe("convertTZ", () => {
  it("should convert same timezone correctly", () => {
    // const now = new Date("2021-08-06T07:54:08 GMT+0800");
    // const now = new Date("Feb 28 2013 19:00:00 GMT+7500");
    // const now = moment('"2021-08-06T07:54:08').tz("Asia/Bangkok").toDate();
    const now = moment
      .tz("May 12th 2014 8AM", "MMM Do YYYY hA", "Asia/Bangkok")
      .toDate();
    // const now = moment('08/06/2021 07:54:08').tz("Asia/Bangkok").toDate();
    console.log(now, "now");
    const result = convertTZ(now, "Asia/Bangkok");
    // console.log(now.toString());
    // console.log(now.toISOString());
    console.log(now.toString(), result.toString());
    console.log(now.toISOString(), result.toISOString());
    // console.log(result.toISOString());
    expect(result.getDate()).toEqual(now.getDate());
    expect(result.getHours()).toEqual(now.getHours());
  });

  it("should convert different timezone correctly", () => {
    // const now = new Date("2021-08-06T01:54:08+0700");
    // const now = moment('"2021-08-06T01:54:08').tz("Asia/Bangkok").toDate();
    // const now = moment('08/06/2021 07:54:08').tz("Asia/Bangkok").toDate();
    const now = moment
      .tz("May 12th 2014 3AM", "MMM Do YYYY hA", "Asia/Bangkok")
      .toDate();
    const result = convertTZ(now, "Africa/Accra");
    expect(result.getDate()).toEqual(11);
    expect(result.getHours()).toEqual(20);
  });
});
