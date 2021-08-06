const { convertTZ } = require("./date");
const moment = require("moment-timezone");

describe("convertTZ", () => {
  it("should convert same timezone correctly", () => {
    const now = moment
      .tz("May 12th 2014 8AM", "MMM Do YYYY hA", "Asia/Bangkok")
      .toDate();
    console.log(now, "now");
    const result = convertTZ(now, "Asia/Bangkok");
    expect(result.getDate()).toEqual(now.getDate());
    expect(result.getHours()).toEqual(now.getHours());
  });

  it("should convert different timezone correctly", () => {
    const now = moment
      .tz("May 12th 2014 3AM", "MMM Do YYYY hA", "Asia/Bangkok")
      .toDate();
    const result = convertTZ(now, "Africa/Accra");
    expect(result.getDate()).toEqual(11);
    expect(result.getHours()).toEqual(20);
  });
});
