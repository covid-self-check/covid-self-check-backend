const { setPatientStatus } = require("./utils");
const { admin } = require("../../init");

describe("setPatientStatus", () => {
  it("should setPatientStatus correctly", () => {
    const mockObj = {};
    const createdDate = new Date();
    setPatientStatus(mockObj, createdDate);
    expect(mockObj).toEqual({
      status: 0,
      needFollowUp: true,
      followUp: [],
      createdDate: admin.firestore.Timestamp.fromDate(createdDate),
      lastUpdatedAt: admin.firestore.Timestamp.fromDate(createdDate),
      isRequestToCallExported: false,
      isRequestToCall: false,
      isNurseExported: false,
      toAmed: 0,
    });
  });
});
