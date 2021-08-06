const { convertTZ } = require("./date");

describe("convertTZ", () => {
  it("should convert same timezone correctly", () => {
    const now = new Date("2021-08-06T07:54:08+07:00");
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
    const now = new Date("2021-08-06T01:54:08+07:00");
    const result = convertTZ(now, "Africa/Accra");
    expect(result.getDate()).toEqual(5);
    expect(result.getHours()).toEqual(18);
  });
});
