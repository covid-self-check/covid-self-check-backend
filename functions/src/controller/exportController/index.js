const XLSX = require("xlsx");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const functions = require("firebase-functions");
const { admin, collection } = require("../../init");
const { generateZipFileRoundRobin } = require("../../utils/zip");
import { validateExportRequestToCallSchema } from "../../schema";
const { statusList } = require("../../api/const");
const {
  patientReportHeader,
  sheetName,
  MAP_PATIENT_FIELD,
} = require("../../utils/status");
const { calculateAge, convertTZ, getDateID } = require("../../utils/date");
const utils = require("./utils");
const { success } = require("../../response/success");

exports.exportR2R = async (data, _context) => {
  const { value, error } = validateExportRequestToCallSchema(data);
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
  const header = ["internal id", "name", "tel"];
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
  const { value, error } = validateExportRequestToCallSchema(data);
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

exports.exportMaster = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection(collection.patient)
      .get();

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
      .collection(collection.patient)
      .where("isNurseExported", "==", false)
      .get();

    const INCLUDE_STATUS = [
      statusList["Y1"],
      statusList["Y2"],
      statusList["R1"],
      statusList["R2"],
    ];

    const results = new Array(INCLUDE_STATUS.length);
    const reportHeader = _.keys(MAP_PATIENT_FIELD);

    for (let i = 0; i < results.length; i++) {
      results[i] = [[...reportHeader]];
    }

    const updatedDocId = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (typeof data.status !== "number") {
        return;
      }
      // exclude unknown, G1 and G2
      if (!INCLUDE_STATUS.includes(data.status)) {
        return;
      }

      updatedDocId.push(doc.id);
      const arr = [];
      for (const key of reportHeader) {
        arr.push(data[MAP_PATIENT_FIELD[key]]);
      }
      const status = data.status - 3;
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
        const docRef = admin.firestore().collection(collection.patient).doc(id);

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
  const { value, error } = validateExportRequestToCallSchema(data);
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

    const snapshot = await admin
      .firestore()
      .collection(collection.patient)
      .get();

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
  const { value, error } = validateExportRequestToCallSchema(data);
  if (error) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง"
    );
  }

  const { volunteerSize } = value;
  const patientList = [];

  const snapshot = await admin.firestore().collection(collection.patient).get();
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

exports.exportTimeSeries = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection(collection.timeSeries)
      .get();

    const headers = [
      "date",
      "active users",
      "drop off Rate",
      "r2cccount",
      "terminate users",
      "activebtw 36 to 72 hrs",
    ];
    const result = [headers];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(data);
      result.push([
        doc.id,
        data.activeUser,
        data.dropoffrate,
        data.r2account,
        data.terminateUser,
        data.usersbtw36hrsto72hrs,
      ]);
    });
    console.log(result);
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet(result);
    XLSX.utils.book_append_sheet(wb, ws, "statistics");
    const filename = `daily_statistics.xlsx`;
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
