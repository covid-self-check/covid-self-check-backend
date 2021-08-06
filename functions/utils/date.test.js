const { convertTZ } = require("./date");

describe("convertTZ", () => {
  const x = new Date();
  const offset = -x.getTimezoneOffset() / 60;

  it("should convert same timezone correctly", () => {
    const now = new Date("2021-08-06T14:54:08+07:00");
    const result = convertTZ(now, "Asia/Bangkok");
    expect(result.getDate()).toEqual(now.getDate());
    expect(result.getHours() - 7 + offset).toEqual(now.getHours());
  });

  it("should convert different timezone correctly", () => {
    const now = new Date("2021-08-06T01:54:08+07:00");
    const result = convertTZ(now, "Africa/Accra");
    expect(result.getDate()).toEqual(5);
    expect(result.getHours()).toEqual(18);
  });

  it("should convert same string timezone correctly", () => {
    const stringTime = "2021-08-06T14:54:08+07:00";
    const now = new Date(stringTime);
    const result = convertTZ(stringTime, "Asia/Bangkok");
    expect(result.getDate()).toEqual(now.getDate());
    expect(result.getHours() - 7 + offset).toEqual(now.getHours());
  });

  it("should convert different string timezone correctly", () => {
    const result = convertTZ("2021-08-06T01:54:08+07:00", "Africa/Accra");
    expect(result.getDate()).toEqual(5);
    expect(result.getHours()).toEqual(18);
  });
});
