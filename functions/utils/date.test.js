const { convertTZ } = require("./date");

describe("convertTZ", () => {
  it("should convert timezone correctly", () => {
    const now = new Date("2021-08-06T07:54:08.993Z");
    const result = convertTZ(now, "Asia/Bangkok");
    expect(result.getDate()).toEqual(now.getDate());
    expect(result.getHours()).toEqual(now.getHours());
  });

  it("should convert timezone correctly", () => {
    const now = new Date("2021-08-06T20:54:08.993Z");
    const result = convertTZ(now, "Africa/Accra");
    expect(result.getDate()).toEqual(6);
    expect(result.getHours()).toEqual(20);
  });
});
