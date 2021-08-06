const { convertTZ } = require("./date");

describe("convertTZ", () => {
  const timeZone = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = "Asia/Bangkok";
  });

  afterEach(() => {
    process.env.TZ = timeZone;
  });

  it("should convert same timezone correctly", () => {
    const now = new Date("2021-08-06T14:54:08");
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
    const now = new Date("2021-08-06T01:54:08");
    const result = convertTZ(now, "Africa/Accra");
    expect(result.getDate()).toEqual(5);
    expect(result.getHours()).toEqual(18);
  });

  it("should convert same string timezone correctly", () => {
    const stringTime = "2021-08-06T14:54:08";
    const now = new Date(stringTime);
    const result = convertTZ(stringTime, "Asia/Bangkok");
    expect(result.getDate()).toEqual(now.getDate());
    expect(result.getHours()).toEqual(now.getHours());
  });

  it("should convert different string timezone correctly", () => {
    const result = convertTZ("2021-08-06T01:54:08", "Africa/Accra");
    expect(result.getDate()).toEqual(5);
    expect(result.getHours()).toEqual(18);
  });
});
