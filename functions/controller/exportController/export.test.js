const utils = require("./utils");
const { admin } = require("../../init");

const mockFbWhere = jest.fn(() => {
  return { get: jest.fn() };
});

const mockCollection = jest.fn(() => {
  return {
    where: mockFbWhere,
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
  describe("R2R", () => {
    describe("updateExportedR2RUsers", () => {
      it("should fetch from R2R collection", () => {
        utils.getUnExportedR2RUsers();
        const arg = mockCollection.mock.calls[0][0];
        expect(arg).toEqual("requestToRegisterAssistance");
      });

      it("should select un exported user", () => {
        utils.getUnExportedR2RUsers();
        const args = mockFbWhere.mock.calls[0];
        expect(args[0]).toEqual("isR2RExported");
        expect(args[1]).toEqual("==");
        expect(args[2]).toEqual(false);
      });
    });

    describe("updateAndSerializeR2CData", () => {});
  });

  describe("R2C", () => {
    describe("updateAndSerializeR2CData", () => {});

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

    describe("updateExportedR2CUser", () => {});
  });
});
