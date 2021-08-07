const utils = require("./utils");
const { admin } = require("../../init");

const mockFbWhere = jest.fn(() => {
  return { get: jest.fn() };
});

const mockUpdate = jest.fn();

const mockCollection = jest.fn(() => {
  return {
    where: mockFbWhere,
    doc: jest.fn(() => ({
      update: mockUpdate,
    })),
  };
});

jest.mock("../../init", () => {
  return {
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
        const arg = mockCollection.mock.calls[0][0];
        expect(arg).toEqual("requestToRegisterAssistance");
      });

      it("should select un exported users", () => {
        utils.getUnExportedR2RUsers();
        const args = mockFbWhere.mock.calls[0];
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
        }));
        // called function
        utils.getUnExportedR2CUsers();

        // check arguments
        const collection = mockCollection.mock.calls[0][0];
        expect(collection).toEqual("patient");

        const whereArgs = mockFbWhere.mock.calls[0];
        expect(whereArgs[0]).toEqual("isRequestToCall");
        expect(whereArgs[1]).toEqual("==");
        expect(whereArgs[2]).toEqual(true);

        const where2Args = mockFbWhere2.mock.calls[0];
        expect(where2Args[0]).toEqual("isRequestToCallExported");
        expect(where2Args[1]).toEqual("==");
        expect(where2Args[2]).toEqual(false);

        const orderByArg = mockOrderBy.mock.calls[0][0];
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
  });
});
