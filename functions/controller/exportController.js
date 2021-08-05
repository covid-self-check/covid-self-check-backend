const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const functions = require("firebase-functions");
const { admin } = require("../init");
const { generateZipFileRoundRobin } = require("../utils/zip");
const { exportRequestToCallSchema } = require("../schema");

exports.exportR2R = async (data, context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize } = value;
  const userList = [];

  const snapshot = await admin
    .firestore()
    .collection("requestToRegisterAssistance")
    .where("isRequestToCallRegister", "==", true)
    .get();

  snapshot.docs.forEach((doc) => {
    userList.push(doc.data());
  });

  const header = ["name", "tel"];
  const result = await generateZipFileRoundRobin(
    volunteerSize,
    userList,
    header,
    (doc) => [doc.name, doc.personalPhoneNo]
  );
  await Promise.all(
    snapshot.docs.map((doc) => {
      const docRef = admin
        .firestore()
        .collection("requestToRegisterAssistance")
        .doc(doc.id);

      return docRef.update({
        isRequestToCallRegister: true,
      });
    })
  );

  return result;
};

exports.exportR2C = async (data, context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize } = value;
  const patientList = [];

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", false)
    .orderBy("lastUpdatedAt")
    .get();

  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const docData = doc.data();
      const dataResult = {
        firstName: docData.firstName,
        lastName: docData.firstName,
        hasCalled: 0,
        id: doc.id,
        personalPhoneNo: docData.personalPhoneNo,
      };
      patientList.push(dataResult);
      // end of side effects

      const docRef = admin.firestore().collection("patient").doc(doc.id);
      docRef.update({
        isRequestToCallExported: true,
      });
    })
  );
  const header = ["internal id", "first name", "call status", "tel"];

  return generateZipFileRoundRobin(
    volunteerSize,
    patientList,
    header,
    (doc) => [doc.id, doc.firstName, doc.hasCalled, `="${doc.personalPhoneNo}"`]
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
    const snapshot = await admin.firestore().collection("patient").get();

    const results = [
      [patientReportHeader],
      [patientReportHeader],
      [patientReportHeader],
      [patientReportHeader],
      [patientReportHeader],
      [patientReportHeader],
      [patientReportHeader],
    ];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const arr = convertToArray(data);
      if (typeof data.status === "number") {
        if (data.status > 0 && data.status < results.length) {
          results[data.status].push(arr);
        }
      } else {
        results[0].push(arr);
      }
    });
    const wb = XLSX.utils.book_new();
    // append result to sheet
    for (let i = 0; i < results.length && i < sheetName.length; i++) {
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
  } catch (err) {
    res.json({ success: false });
  }
};
