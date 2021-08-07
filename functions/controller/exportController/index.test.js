const functions = require("firebase-functions");

describe("exportR2R", () => {
  const MOCK_SCHEMA_VALUE = { volunteerSize: 5 };
  const MOCK_SCHEMA_ERROR_FREE = undefined;
  const exportRequestToCallSchemaMock = jest.fn();

  jest.doMock("../../schema", () => ({
    exportRequestToCallSchema: { validate: exportRequestToCallSchemaMock },
  }));

  jest.doMock("./utils", () => ({
    getUnExportedR2RUsers: jest.fn(),
    serializeData: jest.fn(),
    updateExportedR2RUsers: jest.fn(),
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

    try {
      await exportR2R(MOCK_DATA);
    } catch (e) {
      error = e;
    }

    expect(exportRequestToCallSchemaMock).toBeCalledWith(MOCK_DATA);
    expect(error).toEqual(MOCK_SCHEMA_ERROR);
  });
});
