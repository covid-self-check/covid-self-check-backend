import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import * as XLSX from "xlsx";
import * as  functions from "firebase-functions";
import { admin, collection } from "../../init";
import { ExportRequestToCallType, validateExportRequestToCallSchema } from "../../schema";
import { OnCallHandler, OnRequestHandler, Patient, R2RAssistance } from "../../types";
import { formatPatient, formatter36Hr } from "./utils";
import { calculateAge, convertTZ } from "../../utils/date";
import * as utils from "./utils";
import { statusList } from "../../api/const"
import {
  patientReportHeader,
  sheetName,
  MAP_PATIENT_FIELD,
} from "../../utils/status";
import { QuerySnapshot } from "@google-cloud/firestore";


const { generateZipFileRoundRobin } = require("../../utils/zip");


export const exportR2R: OnCallHandler<ExportRequestToCallType> = async (data, _context) => {
  const { value, error } = validateExportRequestToCallSchema(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize: size } = value;

  // get and serialize user from database
  const snapshot = await utils.getUnExportedR2RUsers() as QuerySnapshot<R2RAssistance>;
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

export const exportR2C: OnCallHandler<ExportRequestToCallType> = async (data, _context) => {
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

export const exportMaster: OnRequestHandler = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection(collection.patient)
      .get();

    const header = ["ที่อยู่", "เขต", "แขวง", "จังหวัด"];
    const result = [header];
    snapshot.forEach((doc) => {
      const data = doc.data() as Patient;

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
    const opts: XLSX.WritingOptions = { bookType: "xlsx", type: 'binary' };

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
    res.json({ success: false });
  }
};

export const exportPatientForNurse: OnRequestHandler = async (req, res) => {
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

    const updatedDocId: string[] = [];

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
    const opts: XLSX.WritingOptions = { bookType: "xlsx", type: "binary" };

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

export const export36hrs: OnCallHandler<ExportRequestToCallType> = async (data, _context) => {
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

  return generateZipFileRoundRobin(
    volunteerSize,
    patientList,
    header,
    formatter36Hr
  );
};

/**
 * one time used only
 */
export const exportAllPatient: OnRequestHandler = async (req, res) => {
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
    const opts: XLSX.WritingOptions = { bookType: "xlsx", type: "binary" };

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

export const exportRequestToCallDayOne: OnCallHandler<ExportRequestToCallType> = async (data, _context) => {
  const { value, error } = validateExportRequestToCallSchema(data);
  if (error) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง"
    );
  }

  const { volunteerSize } = value;
  const patientList: Patient[] = [];

  const snapshot = await admin.firestore().collection(collection.patient).get();
  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const docData = doc.data() as Patient;
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
    formatPatient
  );
};

