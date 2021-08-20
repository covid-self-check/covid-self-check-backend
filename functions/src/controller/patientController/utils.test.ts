const {
  setPatientStatus,
  snapshotExists,
  updateSymptomAddCreatedDate,
  updateSymptomCheckUser,
  updateSymptomCheckAmed,
  updateSymptomUpdateStatus,
  setAmedStatus,
} = require("./utils");
const { admin } = require("../../init");
const functions = require("firebase-functions");

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

describe("snapshotExists", () => {
  it("throw amed", () => {
    function checkExists() {
      const mockSnapshot = { exists: true, data: () => ({ toAmed: 1 }) };
      snapshotExists(mockSnapshot);
    }
    expect(checkExists).toThrowError(
      "your information is already handle by Amed"
    );
  });
  it("throw มีข้อมูลแล้ว", () => {
    function checkExists() {
      const mockSnapshot = { exists: true, data: () => ({ toAmed: 0 }) };
      snapshotExists(mockSnapshot);
    }
    expect(checkExists).toThrowError("มีข้อมูลผู้ใช้ในระบบแล้ว");
  });
});

describe("updateSymptomAddCreatedDate", () => {
  it("should add createdDate correctly", () => {
    const mockObj = {};
    const createdDate = new Date();

    updateSymptomAddCreatedDate(
      mockObj,
      admin.firestore.Timestamp.fromDate(createdDate)
    );
    expect(mockObj).toEqual({
      createdDate: admin.firestore.Timestamp.fromDate(createdDate),
    });
  });
});

describe("updateSymptomCheckUser", () => {
  it("throw ไม่พบผู้ใช้", () => {
    const lineUserID = "testUserId";

    function checkUser() {
      const mockSnapshot = { exists: false };
      updateSymptomCheckUser(mockSnapshot, lineUserID);
    }
    expect(checkUser).toThrowError(`ไม่พบผู้ใช้ ${lineUserID}`);
  });
});

describe("updateSymptomCheckAmed", () => {
  it("should throw Amed", () => {
    function amed() {
      const mockSnapshotData = { toAmed: 1 };
      updateSymptomCheckAmed(mockSnapshotData);
    }
    expect(amed).toThrowError("your information is already handle by Amed");
  });
});

describe("updateSymptomUpdateStatus", () => {
  it("should update status correctly", () => {
    const mockObj = {};
    const date = admin.firestore.Timestamp.fromDate(new Date());
    updateSymptomUpdateStatus(mockObj, 1, "normal", 2, date);
    expect(mockObj).toEqual({
      status: 1,
      status_label_type: "normal",
      triage_score: 2,
      lastUpdatedAt: date,
    });
  });
});

describe("setAmedStatus", () => {
  const statusList = {
    unknown: 0,
    G1: 1,
    G2: 2,
    Y1: 3,
    Y2: 4,
    R1: 5,
    R2: 6,
  };
  const TO_AMED_STATUS = {
    includes: (status: any) => {
      return amedList.includes(status) ? true : false;
    },
  };

  const amedList = [
    statusList["G2"],
    statusList["Y1"],
    statusList["Y2"],
    statusList["R1"],
    statusList["R2"],
  ];
  it("should set status to 1", () => {
    const mockObj = {};
    const mockStatus = 2;
    const previousStatus = 1;
    setAmedStatus(mockObj, mockStatus, previousStatus, TO_AMED_STATUS);
    expect(mockObj).toEqual({
      toAmed: 1,
    });
  });
});
