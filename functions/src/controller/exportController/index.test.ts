import * as functions from "firebase-functions";

describe("exportController", () => {
  const MOCK_RESULT = { ok: true, title: "report.zip", content: "content" };
  const exportRequestToCallSchemaMock = jest.fn();

  jest.doMock("../../schema", () => ({
    validateExportRequestToCallSchema: exportRequestToCallSchemaMock,
  }));

  jest.doMock("../../utils/zip", () => ({
    generateZipFileRoundRobin: generateZipFileRoundRobinMock,
  }));

  const generateZipFileRoundRobinMock = jest
    .fn()
    .mockReturnValue(new Promise((resolve) => resolve(MOCK_RESULT)));

  describe("exportR2R", () => {
    const MOCK_SCHEMA_VALUE = { volunteerSize: 5 };
    const MOCK_SCHEMA_ERROR_FREE = undefined;
    const MOCK_SNAPSHOT = {};
    const MOCK_USERLIST = [] as any[];

    jest.unmock("./utils");
    jest.resetModules();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const getUnExportedR2RUsersMock = jest
      .fn()
      .mockReturnValue(new Promise((resolve) => resolve(MOCK_SNAPSHOT)));
    const serializeDataMock = jest.fn().mockReturnValue(MOCK_USERLIST);
    const updateExportedR2RUsersMock = jest
      .fn()
      .mockReturnValue(new Promise((resolve) => resolve("success")));
    const formatterR2RMock = jest.fn();

    jest.doMock("./utils", () => ({
      getUnExportedR2RUsers: getUnExportedR2RUsersMock,
      serializeData: serializeDataMock,
      updateExportedR2RUsers: updateExportedR2RUsersMock,
      formatterR2R: formatterR2RMock,
    }));

    const { exportR2R } = require(".");

    it("should be able to throw error if schema error in R2R", async () => {
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

    it("should be export R2R correctly if validation success", async () => {
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
        ["internal id", "name", "tel"],
        formatterR2RMock
      );
      expect(updateExportedR2RUsersMock).toBeCalledWith(MOCK_SNAPSHOT);
      expect(result).toBe(MOCK_RESULT);
    });
  });

  describe("exportR2C", () => {
    const MOCK_SCHEMA_VALUE = { volunteerSize: 5 };
    const MOCK_SCHEMA_ERROR_FREE = undefined;
    const MOCK_SNAPSHOT = {};
    const MOCK_PATIENT_LIST = [] as any[];
    const MOCK_RESULT = { ok: true, title: "report.zip", content: "content" };

    jest.unmock("./utils");
    jest.resetModules();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const getUnExportedR2CUsersMock = jest
      .fn()
      .mockReturnValue(new Promise((resolve) => resolve(MOCK_SNAPSHOT)));
    const updateAndSerializeR2CDataMock = jest
      .fn()
      .mockReturnValue(MOCK_PATIENT_LIST);
    const formatterR2CMock = jest.fn();

    jest.doMock("./utils", () => ({
      getUnExportedR2CUsers: getUnExportedR2CUsersMock,
      updateAndSerializeR2CData: updateAndSerializeR2CDataMock,
      formatterR2C: formatterR2CMock,
    }));

    const { exportR2C } = require(".");

    it("should be able to throw error if schema error in R2C", async () => {
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
        result = await exportR2C(MOCK_DATA);
      } catch (e) {
        error = e;
      }

      expect(exportRequestToCallSchemaMock).toBeCalledWith(MOCK_DATA);
      expect(error).toEqual(MOCK_SCHEMA_ERROR);
      expect(result).toBe(undefined);
    });

    it("should be export R2C correctly if validation success", async () => {
      exportRequestToCallSchemaMock.mockReturnValueOnce({
        error: MOCK_SCHEMA_ERROR_FREE,
        value: MOCK_SCHEMA_VALUE,
      });

      const MOCK_DATA = {};
      let error = undefined;
      let result = undefined;

      try {
        result = await exportR2C(MOCK_DATA);
      } catch (e) {
        error = e;
      }

      expect(exportRequestToCallSchemaMock).toBeCalledWith(MOCK_DATA);
      expect(error).toEqual(undefined);
      expect(getUnExportedR2CUsersMock).toBeCalled();
      expect(updateAndSerializeR2CDataMock).toBeCalledWith(MOCK_SNAPSHOT);
      expect(generateZipFileRoundRobinMock).toBeCalledWith(
        MOCK_SCHEMA_VALUE.volunteerSize,
        MOCK_PATIENT_LIST,
        ["internal id", "first name", "call status", "tel"],
        formatterR2CMock
      );
      expect(result).toEqual(MOCK_RESULT);
    });
  });
});
