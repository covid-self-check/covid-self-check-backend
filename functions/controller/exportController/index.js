const XLSX = require("xlsx");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const functions = require("firebase-functions");
const { admin } = require("../../init");
const { generateZipFileRoundRobin } = require("../../utils/zip");
const { exportRequestToCallSchema } = require("../../schema");
const { statusList } = require("../../api/const");
const { patientReportHeader, sheetName } = require("../../utils/status");
const { calculateAge, convertTZ } = require("../../utils/date");
const utils = require("./utils");

exports.exportR2R = async (data, _context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize: size } = value;

  // get and serialize user from database
  const snapshot = await utils.getUnExportedR2RUsers();
  const userList = utils.serializeData(snapshot);

  // create zip file
  const header = ["name", "tel"];
  const result = await generateZipFileRoundRobin(
    size,
    userList,
    header,
    utils.formatterR2R
  );

  // mark user as exported
  await utils.updateExportedR2RUsers(snapshot);

  return result;
};

exports.exportR2C = async (data, _context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize } = value;
  const snapshot = await utils.getUnExportedR2CUsers();
  const patientList = await utils.updateAndSerializeR2CData(snapshot);

  const header = ["internal id", "first name", "call status", "tel"];

  return generateZipFileRoundRobin(
    volunteerSize,
    patientList,
    header,
    utils.formatterR2C
  );
};

exports.exportMasterAddress = async (req, res) => {
  try {
    const { password } = req.query;
    if (password !== "CpciLBG63jEJ") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ไม่มี permission"
      );
    }
    const snapshot = await admin.firestore().collection("patient").get();

    const header = ["ที่อยู่", "เขต", "แขวง", "จังหวัด"];
    const result = [header];
    snapshot.forEach((doc) => {
      const data = doc.data();

      result.push([
        data.address,
        data.district,
        data.prefecture,
        data.province,
      ]);
    });
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet(result);

    XLSX.utils.book_append_sheet(wb, ws, "รายงานที่อยู่ผู้ป่วย 4 สิงหาคม");
    const filename = `report.xlsx`;
    const opts = { bookType: "xlsx", type: "binary" };

    // it must be save to tmp directory because it run on firebase
    const pathToSave = path.join("/tmp", filename);
    XLSX.writeFile(wb, pathToSave, opts);

    const stream = fs.createReadStream(pathToSave);
    // prepare http header
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    stream.pipe(res);
  } catch (err) {
    console.log(err);
    return res.json({ success: false });
  }
};

exports.exportPatientForNurse = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .where("isNurseExported", "==", false)
      .get();

    const INCLUDE_STATUS = [
      statusList["G2"],
      statusList["Y1"],
      statusList["Y2"],
      statusList["R1"],
      statusList["R2"],
    ];

    console.log("include status : ", INCLUDE_STATUS);

    const results = new Array(INCLUDE_STATUS.length);

    for (let i = 0; i < results.length; i++) {
      results[i] = [[...patientReportHeader]];
    }

    const updatedDocId = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (typeof data.status !== "number") {
        return;
      }
      // exclude unknown and G1
      if (!INCLUDE_STATUS.includes(data.status)) {
        return;
      }

      updatedDocId.push(doc.id);

      const arr = [
        data.personalID,
        data.firstName,
        data.lastName,
        data.personalPhoneNo,
        data.emergencyPhoneNo,
        calculateAge(data.birthDate.toDate()),
        data.weight,
        data.height,
        data.gender,
        convertTZ(data.lastUpdatedAt.toDate()),
        data.address,
        data.district,
        data.prefecture,
        data.province,
        data.status,
      ];
      const status = data.status - 2;
      results[status].push(arr);
    });

    const wb = XLSX.utils.book_new();
    // append result to sheet
    for (let i = 0; i < results.length && i < sheetName.length; i++) {
      // not export unknown or g1

      const ws = XLSX.utils.aoa_to_sheet(results[i]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName[i]);
    }
    // write workbook file
    const filename = `report.xlsx`;
    const opts = { bookType: "xlsx", type: "binary" };

    // it must be save to tmp directory because it run on firebase
    const pathToSave = path.join("/tmp", filename);
    XLSX.writeFile(wb, pathToSave, opts);
    // create read stream
    const stream = fs.createReadStream(pathToSave);
    // prepare http header
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    stream.pipe(res);

    await Promise.all([
      updatedDocId.map((id) => {
        const docRef = admin.firestore().collection("patient").doc(id);

        return docRef.update({
          isNurseExported: true,
        });
      }),
    ]);
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};

exports.export36hrs = async (data, _context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize } = value;
  const patientList = await utils.get36hrsUsers();
  const header = ["first name", "tel"];

  const formatter = (doc) => [doc.firstName, `="${doc.personalPhoneNo}"`];
  return generateZipFileRoundRobin(
    volunteerSize,
    patientList,
    header,
    formatter
  );
};

/**
 * one time used only
 */
exports.exportAllPatient = async (req, res) => {
  try {
    const { password } = req.query;
    if (password !== "SpkA43Zadkl") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "ไม่มี permission"
      );
    }

    const snapshot = await admin.firestore().collection("patient").get();

    const statusListArr = _.keys(statusList);
    const results = new Array(statusListArr.length);

    for (let i = 0; i < results.length; i++) {
      results[i] = [[...patientReportHeader]];
    }
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const arr = [
        data.personalID,
        data.firstName,
        data.lastName,
        data.personalPhoneNo,
        data.emergencyPhoneNo,
        calculateAge(data.birthDate.toDate()),
        data.weight,
        data.height,
        data.gender,
        convertTZ(data.lastUpdatedAt.toDate()),
        data.address,
        data.district,
        data.prefecture,
        data.province,
        statusListArr[data.status],
      ];

      results[data.status].push(arr);
    });

    const sheets = [
      "รายงานผู้ป่วยที่ไม่สามารถระบุสี",
      "รายงานผู้ป่วยเขียวไม่มีอาการ",
      "รายงานผู้ป่วยเขียวมีอาการ",
      "รายงานผู้ป่วยเหลืองไม่มีอาการ",
      "รายงานผู้ป่วยเหลืองมีอาการ",
      "รายงานผู้ป่วยแดงอ่อน",
      "รายงานผู้ป่วยแดงเข้ม",
    ];

    const wb = XLSX.utils.book_new();
    // append result to sheet
    for (let i = 0; i < results.length && i < sheets.length; i++) {
      const ws = XLSX.utils.aoa_to_sheet(results[i]);
      XLSX.utils.book_append_sheet(wb, ws, sheets[i]);
    }
    // write workbook file
    const filename = `report.xlsx`;
    const opts = { bookType: "xlsx", type: "binary" };

    // it must be save to tmp directory because it run on firebase
    const pathToSave = path.join("/tmp", filename);
    XLSX.writeFile(wb, pathToSave, opts);
    // create read stream
    const stream = fs.createReadStream(pathToSave);
    // prepare http header
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    stream.pipe(res);
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};

exports.exportRequestToCallDayOne = async (data, _context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง"
    );
  }

  const { volunteerSize } = value;
  const patientList = [];

  const snapshot = await admin.firestore().collection("patient").get();
  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const docData = doc.data();
      patientList.push(docData);
    })
  );
  const headers = [
    "personal id",
    "first name",
    "last name",
    "tel",
    "emergency phone",
  ];
  return generateZipFileRoundRobin(
    volunteerSize,
    patientList,
    headers,
    (doc) => [
      doc.personalID,
      doc.firstName,
      doc.lastName,
      doc.personalPhoneNo,
      doc.emergencyPhoneNo,
    ]
  );
};
