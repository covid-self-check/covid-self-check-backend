// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const {
  authenticateVolunteer,
  getProfile,
  authenticateVolunteerRequest,
} = require("./middleware/authentication");
const { admin, initializeApp } = require("./init");
const { region } = require("./config");
const { exportPatient, convertTZ } = require("./utils");
const { eventHandler } = require("./handler/eventHandler");
const line = require("@line/bot-sdk");
const config = {
  channelAccessToken:
    "lCmCyFN94c2gZfkxzog0xtf5aE2rizp/FtmZdFmsYO4MpJFZn5F+XbbDadPySauxQzi9TUU+jrK05CKnQn9+Jp+VMVNquUyMEMRwdsCy3xDOeRiZE/QRYCC7tEodeUS6qmNJq+YEPqSVf9Vl41tr3AdB04t89/1O/w1cDnyilFU=",
  channelSecret: "dd2876f67511ea13953727cc0f2d51eb",
};
const client = new line.Client(config);
const { historySchema, registerSchema, getProfileSchema } = require("./schema");
const { success } = require("./response/success");
const { getY1Patient, getY2Patient } = require("./utils/status");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// The Firebase Admin SDK to access Firestore.
initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into

exports.registerParticipant = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { value, error } = registerSchema.validate(data);

    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "failed-precondition",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }

    const { lineUserID, lineIDToken, ...obj } = value;
    const { error: authError } = await getProfile({ lineUserID, lineIDToken });
    if (authError) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "ไม่ได้รับอนุญาต"
      );
    }

    var needFollowUp = true;
    var status = "เขียว";
    obj["status"] = status;
    obj["needFollowUp"] = needFollowUp;
    obj["followUp"] = [];
    const createdDate = convertTZ(new Date(), "Asia/Bangkok");
    obj["createdDate"] = admin.firestore.Timestamp.fromDate(createdDate);
    var temp = new Date();
    temp.setDate(new Date().getDate() - 1);
    const lastUpdated = convertTZ(temp, "Asia/Bangkok");
    obj["lastUpdatedAt"] = admin.firestore.Timestamp.fromDate(lastUpdated);

    const snapshot = await admin
      .firestore()
      .collection("patient")
      .doc(lineUserID)
      .get();

    if (snapshot.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        `มีข้อมูลผู้ใช้ ${lineUserID} ในระบบแล้ว`
      );
    }

    await snapshot.ref.create(obj);

    return success(`Registration with ID: ${lineUserID} added`);
  });

exports.getProfile = functions.region(region).https.onCall(async (data, _) => {
  const { value, error } = getProfileSchema.validate(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { data: lineProfile, error: authError } = await getProfile(value);
  if (authError) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      lineProfile.error_description
    );
  }
  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(value.lineUserID)
    .get();

  const { followUp, ...patientData } = snapshot.data();
  const { name, picture } = lineProfile;
  return { line: { name, picture }, patient: patientData };
});

exports.thisEndpointNeedsAuth = functions.region(region).https.onCall(
  authenticateVolunteer(async (data, context) => {
    return { result: `Content for authorized user` };
  })
);

exports.getFollowupHistory = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { lineId } = data;

    // const snapshot = await admin.firestore().collection('followup').where("personalId","==","1").get()
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .doc(lineId)
      .get();

    if (!snapshot.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        `ไม่พบข้อมูลผู้ใช้ ${lineId}`
      );
    }
    return success(snapshot.data().followUp);
  });

exports.getFollowupHistory = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { value, error } = getProfileSchema.validate(data);
    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "failed-precondition",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }
    const { lineUserID, lineIDToken } = value;
    const { data: errorData, error: authError } = await getProfile({
      lineUserID,
      lineIDToken,
    });
    if (authError) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        errorData.error_description
      );
    }

    // const snapshot = await admin.firestore().collection('followup').where("personalId","==","1").get()
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .doc(lineUserID)
      .get();

    if (!snapshot.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        `ไม่พบข้อมูลผู้ใช้ ${lineUserID}`
      );
    }
    return success(snapshot.data().followUp);
  });

exports.exportPatientData = functions
  .region(region)
  .firestore.document("patient/{id}")
  .onCreate(async (snapshot, _) => {
    const id = snapshot.id;

    const documentData = snapshot.data();
    console.log("Trigger create ");
    await exportPatient(id, documentData);
  });

function calculateStatus(snapshot, currentSymptom) {
  console.log(isGreen(snapshot, currentSymptom));
}

//status 0
function isGreen(snapshot, currentSymptom) {
  const data = snapshot.data();
  const age = data.age;
  const diseases = data.congenitalDisease;
  const diseaseList = diseases.split(/[ ,]+/);
  var ok = true;
  const shouldBeFalse = [
    "cough",
    "runnynose",
    "redEye",
    "rash",
    "soreThroat",
    "canNotSmell",
    "canNotTaste",
    "diarrhoeaMoreThan3",
    "tired",
    "stuffyChest",
    "nausea",
    "chestHurt",
    "slowResponse",
    "headAche",
  ];
  const shouldBeTrue = ["canBreathRegularly"];
  const shouldNotHaveCongenitalDisease = [
    "ปอด",
    "หอบ",
    "หลอดลม",
    "ถุงลมโป่งพอง",
    "ไต",
    "หัวใจ",
    "หลอดเลือด",
    "อัมพาต",
    "อัมพฤกษ์",
    "เส้นเลือดในสมอง",
    "ความดัน",
    "ไขมัน",
    "เบาหวาน",
    "ภูมิคุ้มกัน",
    "ตับ",
    "LSD",
    "มะเร็ง",
  ];

  if (age > 5 && age < 60 && currentSymptom.bodyTemperature < 37) {
    shouldBeFalse.every((symptom) => {
      if (currentSymptom[symptom]) {
        ok = false;
        return false;
      }
    });
    shouldBeTrue.every((symptom) => {
      if (!currentSymptom[symptom]) {
        ok = false;
        return false;
      }
    });
    diseaseList.forEach((disease) => {
      shouldNotHaveCongenitalDisease.forEach((checkList) => {
        if (disease.includes(checkList)) {
          ok = false;
        }
      });
    });
  } else {
    return false;
  }
  return ok;
}

function isGreenWithSymptom(snapshot, currentSymptom) {
  const data = snapshot.data();
  const age = data.age;
  const diseases = data.congenitalDisease;
  const diseaseList = diseases.split(/[ ,]+/);
  let ok = true;
  const shouldBeFalse = [
    "cough",
    "runnyNose",
    "redEye",
    "rash",
    "soreThroat",
    "canNotSmell",
    "canNotTaste",
    "diarrhoeaMoreThan3",
    "tired",
    "stuffyChest",
    "nausea",
    "chestHurt",
    "slowResponse",
    "headAche",
  ];
  const shouldBeTrue = ["canBreathRegularly"];
  if (age > 5 && age < 60) {
    shouldBeFalse.every((symptom) => {
      if (currentSymptom[symptom]) {
        ok = false;
        return false;
      }
    });
    shouldBeTrue.every((symptom) => {
      if (!currentSymptom[symptom]) {
        ok = false;
        return false;
      }
    });
  }
  return ok;
}

function isYellow(snapshot, currentSymptom) {}
function isRed(snapshot, currentSymptom) {}

exports.updateSymptom = functions.region(region).https.onCall(async (data) => {
  const { value, error } = historySchema.validate(data);
  if (error) {
    // DEBUG
    console.log(error.details);
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, ...obj } = value;
  const { error: authError, data: errorData } = await getProfile({
    lineUserID,
    lineIDToken,
  });
  if (authError) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      errorData.error_description
    );
  }

  const createdDate = convertTZ(new Date(), "Asia/Bangkok");
  obj.createdDate = admin.firestore.Timestamp.fromDate(createdDate);

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .doc(lineUserID)
    .get();
  if (!snapshot.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `ไม่พบผู้ใช้ ${lineUserID}`
    );
  }

  const { followUp } = snapshot.data();

  if (!followUp) {
    await snapshot.ref.set({ followUp: [obj] });
  } else {
    await snapshot.ref.update({
      followUp: admin.firestore.FieldValue.arrayUnion(obj),
    });
  }
  return success();
});

app.get(
  "/",
  authenticateVolunteerRequest(async (req, res) => {
    try {
      const [y1, y2] = await Promise.all([getY1Patient(), getY2Patient()]);

      const wb = XLSX.utils.book_new();
      // append result to sheet
      const wsY1 = XLSX.utils.aoa_to_sheet(y1);
      const wsY2 = XLSX.utils.aoa_to_sheet(y2);
      // write workbook file
      XLSX.utils.book_append_sheet(wb, wsY1, "รายงานผู้ป่วยสีเหลืองไม่มีอาการ");
      XLSX.utils.book_append_sheet(wb, wsY2, "รายงานผู้ป่วยสีเหลืองมีอาการ");
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
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      stream.pipe(res);
    } catch (err) {
      return { ok: false, message: err.message };
    }
  })
);

exports.fetchNotUpdatedPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    const snapshot = await admin.firestore().collection("patient").get();

    var notUpdatedList = [];
    const currentDate = new Date().getDate();
    snapshot.forEach((doc) => {
      const patient = doc.data();
      const lastUpdatedDate = patient.lastUpdatedAt.toDate().getDate();
      if (lastUpdatedDate - currentDate !== 0) {
        notUpdatedList.push(data);
      }
    });
    return success(notUpdatedList);
  });

exports.createReport = functions.region(region).https.onRequest(app);

exports.fetchYellowPatients = functions
  .region(region)
  .https.onCall(async () => {
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .where("status", "==", "เหลือง")
      .get();

    var patientList = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      patientList.push(data);
    });
    return success(patientList);
  });

exports.fetchGreenPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .where("status", "==", "เขียว")
      .get();

    var patientList = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      patientList.push(data);
    });
    return success(patientList);
  });
exports.fetchRedPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .where("status", "==", "แดง")
      .get();

    var patientList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      patientList.push(data);
    });
    return success(patientList);
  });

exports.Webhook = functions.region(region).https.onRequest(async (req, res) => {
  const event = req.body.events[0];
  const userId = event.source.userId;
  const profile = client.getProfile(userId);
  const userObject = { userId: userId, profile: await profile };
  console.log(userObject);
  await eventHandler(event, userObject, client);
  res.sendStatus(200);
});

exports.check = functions.region(region).https.onRequest(async (req, res) => {
  return res.sendStatus(200);
});
