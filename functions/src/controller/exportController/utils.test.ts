const utils = require("./utils");

const mockFbWhere = jest.fn(() => {
  return { get: jest.fn() };
});

const mockUpdate = jest.fn();
const mockDoc = jest.fn(() => ({
  update: mockUpdate,
}));
const mockGet36Users = jest.fn()

const mockCollection = jest.fn(() => {
  return {
    where: mockFbWhere,
    doc: mockDoc,
    get: mockGet36Users,
  };
});

jest.mock("../../init", () => {
  return {
    ...jest.requireActual("../../init"),
    admin: {
      firestore: () => ({
        collection: mockCollection,
      }),
    },
  };
});

describe("exportController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("R2R", () => {
    describe("getUnExportedR2RUsers", () => {
      it("should fetch from R2R collection", () => {
        utils.getUnExportedR2RUsers();
        const arg = (mockCollection.mock.calls[0] as any)[0];
        expect(arg).toEqual("requestToRegisterAssistance");
      });

      it("should select un exported users", () => {
        utils.getUnExportedR2RUsers();
        const args = mockFbWhere.mock.calls[0] as any;
        expect(args[0]).toEqual("isR2RExported");
        expect(args[1]).toEqual("==");
        expect(args[2]).toEqual(false);
      });
    });
  });

  describe("R2C", () => {
    describe("updateAndSerializeR2CData", () => {
      it("should select un exported users", () => {
        // mock
        const mockGet = jest.fn();
        const mockOrderBy = jest.fn(() => ({ get: mockGet }));
        const mockFbWhere2 = jest.fn(() => ({ orderBy: mockOrderBy }));
        mockFbWhere.mockImplementationOnce(() => ({
          where: mockFbWhere2,
        } as any));
        // called function
        utils.getUnExportedR2CUsers();

        // check arguments
        const collection = (mockCollection.mock.calls[0] as any)[0];
        expect(collection).toEqual("patient");

        const whereArgs = mockFbWhere.mock.calls[0] as any;
        expect(whereArgs[0]).toEqual("isRequestToCall");
        expect(whereArgs[1]).toEqual("==");
        expect(whereArgs[2]).toEqual(true);

        const where2Args = mockFbWhere2.mock.calls[0] as any;
        expect(where2Args[0]).toEqual("isRequestToCallExported");
        expect(where2Args[1]).toEqual("==");
        expect(where2Args[2]).toEqual(false);

        const orderByArg = (mockOrderBy.mock.calls[0] as any)[0];
        expect(orderByArg).toEqual("lastUpdatedAt");

        expect(mockGet).toHaveBeenCalledTimes(1);
      });
    });

    describe("makeR2CPayload", () => {
      it("should contain exact field in the result payload", () => {
        const docId = "test.id";
        const fname = "test_user_first_name";
        const lname = "test_user_last_name";
        const phoneNo = "081xxxxxxx";
        const data = {
          address: "home",
          firstName: fname,
          lastName: lname,
          digitalLiteracy: false,
          district: "โนนกลาง",
          gender: "male",
          personalPhoneNo: phoneNo,
        };
        const result = utils.makeR2CPayload(docId, data);
        expect(result.id).toEqual(docId);
        expect(result.firstName).toEqual(fname);
        expect(result.lastName).toEqual(lname);
        expect(result.hasCalled).toEqual(0);
        expect(result.personalPhoneNo).toEqual(phoneNo);
      });
    });

    describe("serializeData", () => {
      it("should get all data from collection snapshot and return to array", () => {
        const MOCK_DOC_1 = { id: "id 1", data: () => ({ id: "id 1", data: "data 1" }) };
        const MOCK_DOC_2 = { id: "id 2", data: () => ({ id: "id 2", data: "data 2" }) };
        const MOCK_SNAPSHOT = { docs: [MOCK_DOC_1, MOCK_DOC_2] };
        const EXPECTED_RESULT = [{ id: "id 1", data: "data 1" }, { id: "id 2", data: "data 2" }];

        const result = utils.serializeData(MOCK_SNAPSHOT);

        expect(result).toEqual(EXPECTED_RESULT);
      });
    });

    describe("updateExportedR2RUsers", () => {
      it("should update all data from collection snapshot with isUpdated: true", async () => {
        const MOCK_DOC_1 = { id: "id 1" };
        const MOCK_DOC_2 = { id: "id 2" };
        const MOCK_SNAPSHOT = { docs: [MOCK_DOC_1, MOCK_DOC_2] };

        await utils.updateExportedR2RUsers(MOCK_SNAPSHOT);
        expect(mockDoc).toHaveBeenNthCalledWith(1, "id 1");
        expect(mockDoc).toHaveBeenNthCalledWith(2, "id 2");

        const UPDATE_PARAM = {
          isR2RExported: true,
        };
        expect(mockUpdate).toHaveBeenNthCalledWith(1, UPDATE_PARAM);
        expect(mockUpdate).toHaveBeenNthCalledWith(2, UPDATE_PARAM);
      });
    });

    describe("get36hrsUsers", () => {
      it("should get all users that is between 36 and 72 hours last updated symptom", async () => {
        const MOCK_DOC_1 = { id: "id 1" };
        const MOCK_DOC_2 = { id: "id 2" };
        const MOCK_SNAPSHOT = { docs: [MOCK_DOC_1, MOCK_DOC_2] };

        await utils.updateExportedR2RUsers(MOCK_SNAPSHOT);
        expect(mockDoc).toHaveBeenNthCalledWith(1, "id 1");
        expect(mockDoc).toHaveBeenNthCalledWith(2, "id 2");

        const UPDATE_PARAM = {
          isR2RExported: true,
        };
        expect(mockUpdate).toHaveBeenNthCalledWith(1, UPDATE_PARAM);
        expect(mockUpdate).toHaveBeenNthCalledWith(2, UPDATE_PARAM);
      });
    });
  });
});
