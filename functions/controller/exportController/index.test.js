const functions = require("firebase-functions");

describe("exportR2R", () => {
  const MOCK_SCHEMA_VALUE = { volunteerSize: 5 };
  const MOCK_SCHEMA_ERROR_FREE = undefined;
  const MOCK_SNAPSHOT = {};
  const MOCK_USERLIST = [];
  const MOCK_RESULT = { ok: true, title: "report.zip", content: "content" };

  const exportRequestToCallSchemaMock = jest.fn();
  const getUnExportedR2RUsersMock = jest
    .fn()
    .mockReturnValue(new Promise((resolve) => resolve(MOCK_SNAPSHOT)));
  const serializeDataMock = jest.fn().mockReturnValue(MOCK_USERLIST);
  const updateExportedR2RUsersMock = jest
    .fn()
    .mockReturnValue(new Promise((resolve) => resolve("success")));
  const generateZipFileRoundRobinMock = jest
    .fn()
    .mockReturnValue(new Promise((resolve) => resolve(MOCK_RESULT)));
  const formatterR2RMock = jest.fn();

  jest.doMock("../../schema", () => ({
    exportRequestToCallSchema: { validate: exportRequestToCallSchemaMock },
  }));

  jest.doMock("./utils", () => ({
    getUnExportedR2RUsers: getUnExportedR2RUsersMock,
    serializeData: serializeDataMock,
    updateExportedR2RUsers: updateExportedR2RUsersMock,
    formatterR2R: formatterR2RMock,
  }));

  jest.doMock("../../utils/zip", () => ({
    generateZipFileRoundRobin: generateZipFileRoundRobinMock,
  }));

  const { exportR2R } = require(".");

  it("should be able to throw error if schema error", async () => {
    const MOCK_SCHEMA_ERROR = new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
    exportRequestToCallSchemaMock.mockReturnValueOnce({
      error: MOCK_SCHEMA_ERROR,
      value: MOCK_SCHEMA_VALUE,
    });

    const MOCK_DATA = {};
    let error = undefined;
    let result = undefined;

    try {
      result = await exportR2R(MOCK_DATA);
    } catch (e) {
      error = e;
    }

    expect(exportRequestToCallSchemaMock).toBeCalledWith(MOCK_DATA);
    expect(error).toEqual(MOCK_SCHEMA_ERROR);
    expect(result).toBe(undefined);
  });

  it("should be export correctly if validation success", async () => {
    exportRequestToCallSchemaMock.mockReturnValueOnce({
      error: MOCK_SCHEMA_ERROR_FREE,
      value: MOCK_SCHEMA_VALUE,
    });

    const MOCK_DATA = {};
    let error = undefined;
    let result = undefined;

    try {
      result = await exportR2R(MOCK_DATA);
    } catch (e) {
      error = e;
    }

    expect(exportRequestToCallSchemaMock).toBeCalledWith(MOCK_DATA);
    expect(error).toEqual(undefined);
    expect(getUnExportedR2RUsersMock).toBeCalled();
    expect(serializeDataMock).toBeCalledWith(MOCK_SNAPSHOT);
    expect(generateZipFileRoundRobinMock).toBeCalledWith(
      MOCK_SCHEMA_VALUE.volunteerSize,
      MOCK_USERLIST,
      ["name", "tel"],
      formatterR2RMock
    );
    expect(updateExportedR2RUsersMock).toBeCalledWith(MOCK_SNAPSHOT);
    expect(result).toBe(MOCK_RESULT);
  });
});
