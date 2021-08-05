// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const { convertTZ } = require("./utils");
const {
  authenticateVolunteer,
  getProfile,
  authenticateVolunteerRequest,
} = require("./middleware/authentication");
const { admin, initializeApp } = require("./init");
const { eventHandler } = require("./handler/eventHandler");
const line = require("@line/bot-sdk");
const config = {
  channelAccessToken: functions.config().line.channel_token,
  channelSecret: functions.config().line.channel_secret,
};
const client = new line.Client(config);
const {
  historySchema,
  registerSchema,
  getProfileSchema,
  importPatientIdSchema,
  exportRequestToCallSchema,
  requestToRegisterSchema,
} = require("./schema");
const { success } = require("./response/success");
const {
  patientReportHeader,
  convertToArray,
  sheetName,
} = require("./utils/status");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { backup } = require("./backup");
const { generateZipFileRoundRobin } = require("./utils/zip");
const { notifyToLine } = require("./linenotify");
const region = require("./config/index").config.region;
const { convertTimestampToStr } = require("./utils/date");

const { sendPatientstatus } = require("./linefunctions/linepushmessage");
const {makeStatusAPIPayload,makeRequest,statusList} = require("./api/api")

const app = express();
app.use(cors({ origin: true }));

// The Firebase Admin SDK to access Firestore.
initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original

exports.registerParticipant = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { value, error } = registerSchema.validate(data);

    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }

    const { lineUserID, lineIDToken, noAuth, ...obj } = value;
    const { error: authError } = await getProfile({
      lineUserID,
      lineIDToken,
      noAuth,
    });
    if (authError) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "ไม่ได้รับอนุญาต"
      );
    }

    var needFollowUp = true;
    // TODO : fix schema
    obj["gotFavipiravir"] = obj["gotFavipiravia"];
    delete obj["gotFavipiravia"];
    obj["status"] = 0;
    obj["needFollowUp"] = needFollowUp;
    obj["followUp"] = [];
    const createdDate = convertTZ(new Date(), "Asia/Bangkok");
    const createdTimestamp = admin.firestore.Timestamp.fromDate(createdDate);
    obj["createdDate"] = createdTimestamp;
    obj["lastUpdatedAt"] = createdTimestamp;
    obj["isRequestToCallExported"] = false;
    obj["isRequestToCall"] = false;

    const snapshot = await admin
      .firestore()
      .collection("patient")
      .doc(lineUserID)
      .get();

    if (snapshot.exists) {
      throw new functions.https.HttpsError(
        "already-exists",
        "มีข้อมูลผู้ใช้ในระบบแล้ว"
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
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth } = value;
  const { data: lineProfile, error: authError } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
  });
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

  const { name, picture } = lineProfile;
  if (snapshot.exists) {
    const { followUp, ...patientData } = snapshot.data();
    const serializeData = convertTimestampToStr(patientData);
    return { line: { name, picture }, patient: serializeData };
  } else {
    return { line: { name, picture }, patient: null };
  }
});

exports.thisEndpointNeedsAuth = functions.region(region).https.onCall(
  authenticateVolunteer(async (data, context) => {
    return { result: `Content for authorized user` };
  })
);

exports.getFollowupHistory = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { value, error } = getProfileSchema.validate(data);
    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }
    const { lineUserID, lineIDToken, noAuth } = value;
    const { data: errorData, error: authError } = await getProfile({
      lineUserID,
      lineIDToken,
      noAuth,
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

exports.updateSymptom = functions.region(region).https.onCall(async (data) => {
  const { value, error } = historySchema.validate(data);
  if (error) {
    // DEBUG
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth, ...obj } = value;
  const { error: authError, data: errorData } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
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

  const { followUp, firstName, lastName } = snapshot.data();
  //TO BE CHANGED: snapshot.data.apply().status = statusCheckAPIorSomething;
  //update lastUpdatedAt field on patient
  await snapshot.ref.update({
    lastUpdatedAt: admin.firestore.Timestamp.fromDate(createdDate),
  });

  const formPayload = makeStatusAPIPayload(snapshot.data());
  const {inclusion_label,inclusion_label_type,triage_score} = await makeRequest(formPayload);
  console.log("status is:",inclusion_label);

  obj["status"] = statusList[inclusion_label];
  obj["status_label_type"] = inclusion_label_type;
  obj["triage_score"] = triage_score;
  

  if (!followUp) {
    await snapshot.ref.set({ ...obj, followUp: [obj] });
  } else {
    await snapshot.ref.update({
      ...obj,
      followUp: admin.firestore.FieldValue.arrayUnion(obj),
    });
  }
  const status = "We are the CHAMPION!!";

  try {
    // sendPatientstatus(lineUserID, status, config.channelAccessToken);
  } catch (err) {
    console.log(err);
  }
  // if (status === 'We are the CHAMPION!!') {
  //   await notifyToLine(`ผู้ป่วย: ${firstName} ${lastName} มีการเปลี่ยนแปลงอาการฉุกเฉิน`)
  // }
  return success();
});

// app.get("/master", async (req, res) => {
//   try {
//     const { password } = req.query;
//     if (password !== "CpciLBG63jEJ") {
//       throw new functions.https.HttpsError(
//         "permission-denied",
//         "ไม่มี permission"
//       );
//     }
//     const snapshot = await admin.firestore().collection("patient").get();

//     const header = ["ที่อยู่", "เขต", "แขวง", "จังหวัด"];
//     const result = [header];
//     snapshot.forEach((doc) => {
//       const data = doc.data();

//       result.push([
//         data.address,
//         data.district,
//         data.prefecture,
//         data.province,
//       ]);
//     });
//     const wb = XLSX.utils.book_new();

//     const ws = XLSX.utils.aoa_to_sheet(result);

//     XLSX.utils.book_append_sheet(wb, ws, "รายงานที่อยู่ผู้ป่วย 4 สิงหาคม");
//     const filename = `report.xlsx`;
//     const opts = { bookType: "xlsx", type: "binary" };

//     // it must be save to tmp directory because it run on firebase
//     const pathToSave = path.join("/tmp", filename);
//     XLSX.writeFile(wb, pathToSave, opts);

//     const stream = fs.createReadStream(pathToSave);
//     // prepare http header
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     stream.pipe(res);
//   } catch (err) {
//     console.log(err);
//     return res.json({ success: false });
//   }
// });

app.get(
  "/",
  authenticateVolunteerRequest(async (req, res) => {
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
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      stream.pipe(res);
    } catch (err) {
      res.json({ success: false });
    }
  })
);

exports.fetchNotUpdatedPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    // const snapshot = await admin.firestore().collection("patient").get();
    // var notUpdatedList = [];
    // const currentDate = convertTZ(new Date(), "Asia/Bangkok");
    // snapshot.forEach((doc) => {
    //   const patient = doc.data();

    //   const lastUpdatedDate = patient.lastUpdatedAt.toDate();
    //   var hours = Math.abs(currentDate - lastUpdatedDate) / 36e5;
    //   if (hours >= 36) {
    //     notUpdatedList.push(patient);
    //   }
    // });
    // return success(notUpdatedList);
    return success();
  });

exports.createReport = functions.region(region).https.onRequest(app);

exports.fetchYellowPatients = functions
  .region(region)
  .https.onCall(async () => {
    // const snapshot = await admin
    //   .firestore()
    //   .collection("patient")
    //   .where("status", "==", "เหลือง")
    //   .get();

    // var patientList = [];

    // snapshot.forEach((doc) => {
    //   const data = doc.data();
    //   patientList.push(data);
    // });
    // return success(patientList);
    return success();
  });

exports.fetchGreenPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    // const snapshot = await admin
    //   .firestore()
    //   .collection("patient")
    //   .where("status", "==", "เขียว")
    //   .get();

    // var patientList = [];

    // snapshot.forEach((doc) => {
    //   const data = doc.data();
    //   patientList.push(data);
    // });
    // return success(patientList);
    return success();
  });
exports.fetchRedPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    // const snapshot = await admin
    //   .firestore()
    //   .collection("patient")
    //   .where("status", "==", "แดง")
    //   .get();

    // var patientList = [];
    // snapshot.forEach((doc) => {
    //   const data = doc.data();
    //   patientList.push(data);
    // });
    // return success(patientList);
    return success();
  });

exports.check = functions.region(region).https.onRequest(async (req, res) => {
  return res.sendStatus(200);
});

exports.requestToCall = functions.region(region).https.onCall(async (data) => {
  const { value, error } = getProfileSchema.validate(data);
  if (error) {
    console.log(error.details);
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ข้อมูลไม่ถูกต้อง",
      error.details
    );
  }

  const { lineUserID, lineIDToken, noAuth } = value;
  const { error: authError } = await getProfile({
    lineUserID,
    lineIDToken,
    noAuth,
  });
  if (authError) {
    throw new functions.https.HttpsError("unauthenticated", "ไม่ได้รับอนุญาต");
  }

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

  const { isRequestToCall } = snapshot.data();

  if (isRequestToCall) {
    return success(`userID: ${lineUserID} has already requested to call`);
  }

  await snapshot.ref.update({
    isRequestToCall: true,
    isRequestToCallExported: false,
  });
  return success();
});

exports.exportRequestToCallDayOne = functions.region(region).https.onCall(
  authenticateVolunteer(async (data, context) => {
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
        const dataResult = {
          firstName: docData.firstName,
          lastName: docData.firstName,
          hasCalled: "",
          id: doc.id,
          personalPhoneNo: docData.personalPhoneNo,
        };
        patientList.push(dataResult);
      })
    );

    const headers = ["internal id", "first name", "call status", "tel"];

    return generateZipFileRoundRobin(
      volunteerSize,
      patientList,
      headers,
      (doc) => [
        doc.id,
        doc.firstName,
        doc.hasCalled,
        `="${doc.personalPhoneNo}"`,
      ]
    );
  })
);

exports.exportRequestToCall = functions.region(region).https.onCall(
  authenticateVolunteer(async (data, context) => {
    // const { value, error } = exportRequestToCallSchema.validate(data);
    // if (error) {
    // throw new functions.https.HttpsError(
    //   "invalid-argument",
    //   "ข้อมูลไม่ถูกต้อง"
    // );
    // }
    // const { volunteerSize } = value;
    // var patientList = [];

    // const snapshot = await admin
    //   .firestore()
    //   .collection("patient")
    //   .where("isRequestToCall", "==", true)
    //   .where("isRequestToCallExported", "==", false)
    //   .orderBy("lastUpdatedAt")
    //   .get();

    // await Promise.all(
    //   snapshot.docs.map((doc) => {
    //     // WARNING SIDE EFFECT inside map
    //     const docData = doc.data();
    //     const dataResult = {
    //       firstName: docData.firstName,
    //       lastName: docData.firstName,
    //       hasCalled: 0,
    //       id: doc.id,
    //       personalPhoneNo: docData.personalPhoneNo,
    //     };
    //     patientList.push(dataResult);
    //     // end of side effects

    //     const docRef = admin.firestore().collection("patient").doc(doc.id);
    //     docRef.update({
    //       isRequestToCallExported: true,
    //     });
    //   })
    // );

    // return generateZipFileRoundRobin(
    //   volunteerSize,
    //   patientList,
    //   headers,
    //   (doc) => [
    //     doc.id,
    //     doc.firstName,
    //     doc.hasCalled,
    //     `="${doc.personalPhoneNo}"`,
    //   ]
    // );
    return success();
  })
);

exports.importFinishedRequestToCall = functions.region(region).https.onCall(
  authenticateVolunteer(async (data) => {
    const { value, error } = importPatientIdSchema.validate(data);

    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }
    const { ids } = value;
    const snapshot = await admin
      .firestore()
      .collection("patient")
      .where("isRequestToCall", "==", true)
      .where("isRequestToCallExported", "==", true)
      .get();

    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => {
      const hasCalled = ids.includes(doc.id);
      const docRef = admin.firestore().collection("patient").doc(doc.id);
      if (hasCalled) {
        batch.update(docRef, {
          isRequestToCall: false,
          isRequestToCallExported: false,
        });
      } else {
        batch.update(docRef, {
          isRequestToCallExported: false,
        });
      }
    });

    await batch.commit();
    return success();
  })
);
exports.webhook = functions.region(region).https.onRequest(async (req, res) => {
  res.sendStatus(200);
  try {
    const event = req.body.events[0];
    const userId = event.source.userId;
    const profile = client.getProfile(userId);
    const userObject = { userId: userId, profile: await profile };
    console.log(userObject);
    // console.log(event)
    await eventHandler(event, userObject, client);
  } catch (err) {
    console.log("Not from line application.");
  }
});

// exports.testExportRequestToCall = functions.region(region).https.onRequest(
//   authenticateVolunteerRequest(async (req, res) => {
//     const { value, error } = exportRequestToCallSchema.validate(req.body);
//     if (error) {
//       console.log(error.details);
//       return res.status(412).json(error.details);
//     }
//     const { volunteerSize } = value;
//     var limit = 250;
//     var lastVisible = 0;
//     var i = 0;
//     var patientList = [];
//     while (true){
//       console.log("250 round:",i);
//       const snapshot = await admin
//         .firestore()
//         .collection("patient")
//         .orderBy("lastUpdatedAt")
//         .startAfter(lastVisible).limit(limit)
//         .get();
//       if(i>3){
//         break;
//       }
//       lastVisible += snapshot.size-1;
//       console.log(lastVisible);
//       i++;
//       const batch = admin.firestore().batch();
//       snapshot.docs.forEach((doc) => {
//       // console.log(doc.id, "id");
//         const docRef = admin.firestore().collection("patient").doc(doc.id);
//         batch.update(docRef, {
//           isRequestToCall:true,
//           isRequestToCallExported: false,
//         });
//       });

//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         const dataResult = {
//           firstName: data.firstName,
//           lastName: data.firstName,
//           hasCalled: 0,
//           id: doc.id,
//           personalPhoneNo: data.personalPhoneNo,
//         };
//         patientList.push(dataResult);
//       });

//       snapshot.docs.forEach((doc) => {
//         const docRef = admin.firestore().collection("patient").doc(doc.id);
//         batch.update(docRef, {
//           isRequestToCall:true,
//           isRequestToCallExported: false,
//         });
//       });
//       //console.log(batch, 'batch')
//       await batch.commit();
//     }
//     console.log("patientlist is:",patientList.length);
//     //generateZipFile(res, size, patientList);
//     generateZipFileRoundRobin(res, volunteerSize, patientList);

//   })
// );

exports.backupFirestore = functions
  .region(region)
  .pubsub.schedule("every day 18:00")
  .timeZone("Asia/Bangkok")
  .onRun(backup);

exports.getNumberOfPatients = functions
  .region(region)
  .https.onRequest(async (req, res) => {
    const snapshot = await admin.firestore().collection("patient").get();

    return res.status(200).json(success(snapshot.size));
  });

exports.requestToRegister = functions
  .region(region)
  .https.onCall(async (data) => {
    const { value, error } = requestToRegisterSchema.validate(data);
    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }

    const { lineUserID, lineIDToken, noAuth } = value;
    const { data: lineProfile, error: authError } = await getProfile({
      lineUserID,
      lineIDToken,
      noAuth,
    });
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

    if (snapshot.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `ผู้ใช้ ${lineUserID} ลงทะเบียนในระบบแล้ว ไม่จำเป็นต้องขอรับความช่วยเหลือในการลงทะเบียน`
      );
    } else {
      const requestRegisterSnapshot = await admin
        .firestore()
        .collection("requestToRegisterAssistance")
        .doc(lineUserID)
        .get();

      if (requestRegisterSnapshot.exists) {
        throw new functions.https.HttpsError(
          "already-exists",
          `มีข้อมูลผู้ใช้ ${lineUserID} ในรายชื่อการโทรแล้ว`
        );
      }
      const obj = {
        name: value.name,
        personalPhoneNo: value.personalPhoneNo,
      };
      await requestRegisterSnapshot.ref.create(obj);
      return success();
    }
  });
