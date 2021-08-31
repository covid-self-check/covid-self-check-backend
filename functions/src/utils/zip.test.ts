import * as faker from "faker";

import * as _ from "lodash";

const mockGenerateAsync = jest.fn(() => {
  return "";
});

jest.mock("jszip", () => {
  return jest.fn().mockImplementation(() => {
    return {
      file: jest.fn(),
      generateAsync: mockGenerateAsync,
    };
  });
});

const {
  makeAoA,
  fillWith,
  prepareZipFile,
  generateZipFileRoundRobin,
} = require("./zip");

describe("zip", () => {


  const JSZip = require("jszip");

  describe("makeAOA", () => {
    it("should return an array of a given size", () => {
      expect(makeAoA(5).length).toEqual(5);
      expect(makeAoA(10).length).toEqual(10);
      expect(makeAoA(15).length).toEqual(15);
      expect(makeAoA(20).length).toEqual(20);
    });

    it("return array of array in which each element is an empty array", () => {
      const aoa = makeAoA(5);
      for (const arr of aoa) {
        expect(Array.isArray(arr)).toEqual(true);
        expect(arr.length).toEqual(0);
      }
    });
  });

  describe("fillWith", () => {
    it("should fill aoa in a round robin fashion", () => {
      const data = [];
      for (let i = 1; i <= 10; i++) {
        data.push(i);
      }
      const aoa = makeAoA(5);
      fillWith(aoa, data);

      for (let i = 0; i < aoa.length; i++) {
        expect(aoa[i]).toEqual([i + 1, i + 6]);
      }
    });
  });

  describe("prepareZipFile", () => {
    it("should call zip.file", () => {
      const size = 5;
      const aoa = makeAoA(size);
      const zip = new JSZip();
      prepareZipFile(zip, aoa, [], () => []);
      // expect number of files to equal to size;
      expect(zip.file).toHaveBeenCalledTimes(size);
    });

    it("should encode csv ", () => {
      // prepare data
      const size = 5;
      const aoa = makeAoA(size);
      const data = [];
      for (let i = 0; i < size; i++) {
        data.push({
          name: faker.name.findName(),
          personalPhoneNo: faker.phone.phoneNumber(),
        });
      }

      fillWith(aoa, data);
      const header = ["name", "tel"];

      const zip = new JSZip();
      prepareZipFile(zip, aoa, header, (doc: any) => [
        doc.name,
        doc.personalPhoneNo,
      ]);

      // test
      for (let i = 0; i < size; i++) {
        const args = zip.file.mock.calls[i];
        // expect filename to equal to its order
        expect(args[0]).toEqual(`${i + 1}.csv`);

        const headerStr = header.join(",");
        const dataStr = _.values(data[i]).join(",");
        // compare csv string with the args pass to zip.file
        const csv = `\ufeff${headerStr}\n${dataStr}\n`;
        expect(args[1]).toEqual(csv);
      }
    });
  });

  describe("generateZipFileRoundRobin", () => {
    it("expect encoded type to equal to base64", async () => {
      await generateZipFileRoundRobin(5, [], [], (el: any) => []);
      expect(mockGenerateAsync).toHaveBeenCalledTimes(1);
      expect((mockGenerateAsync as any).mock.calls[0][0].type).toEqual("base64");
    });

    it("should return correct field name", async () => {
      const result = await generateZipFileRoundRobin(5, [], [], (el: any) => []);
      console.log(result);
      expect(result.ok).toEqual(true);
      expect(result.title).toEqual("report.zip");
      expect(result.content).toBeDefined();
    });
  });
});
