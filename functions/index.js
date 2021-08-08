// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
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
const { getProfileSchema, exportRequestToCallSchema } = require("./schema");
const { success } = require("./response/success");
const express = require("express");
const cors = require("cors");
const { backup } = require("./backup");
const { generateZipFileRoundRobin } = require("./utils/zip");
const region = require("./config/index").config.region;

const {
  exportController,
  patientController,
  requestController,
  importController,
} = require("./controller");

const app = express();
app.use(cors({ origin: true }));

// The Firebase Admin SDK to access Firestore.
initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original

// app.get("/master", exportController.exportMasterAddress);

// app.get("/patient", exportController.exportAllPatient);

app.get(
  "/",
  authenticateVolunteerRequest(exportController.exportPatientForNurse)
);

// app.get("/", exportController.exportPatientForNurse);

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
    console.error(err);
    console.log("Not from line application.");
  }
});

exports.registerParticipant = functions
  .region(region)
  .https.onCall(patientController.registerPatient);

exports.getProfile = functions
  .region(region)
  .https.onCall(patientController.getProfile);

exports.exportRequestToRegister = functions
  .region(region)
  .https.onCall(authenticateVolunteer(exportController.exportR2R));
exports.export36hrs = functions
  .region(region)
  .https.onCall(authenticateVolunteer(exportController.export36hrs));

exports.exportRequestToCall = functions
  .region(region)
  .https.onCall(authenticateVolunteer(exportController.exportR2C));

exports.exportRequestToCallDayOne = functions
  .region(region)
  .https.onCall(
    authenticateVolunteer(exportController.exportRequestToCallDayOne)
  );

exports.importFinishedRequestToCall = functions
  .region(region)
  .https.onCall(authenticateVolunteer(importController.importFinishR2C));
exports.importWhitelist = functions
  .region(region)
  .https.onCall(authenticateVolunteer(importController.importWhitelist));

exports.thisEndpointNeedsAuth = functions.region(region).https.onCall(
  authenticateVolunteer(async (data, context) => {
    return { result: `Content for authorized user` };
  })
);

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

exports.getNumberOfPatientsV2 = functions
  .region(region)
  .https.onRequest(async (req, res) => {
    const snapshot = await admin
      .firestore()
      .collection("userCount")
      .document("users")
      .get();
    return res.status(200).json(success(snapshot[0].data().count));
  });

exports.requestToRegister = functions
  .region(region)
  .https.onCall(requestController.requestToRegister);

exports.check = functions.region(region).https.onRequest(async (req, res) => {
  return res.sendStatus(200);
});

exports.requestToCall = functions
  .region(region)
  .https.onCall(requestController.requestToCall);

exports.updateSymptom = functions
  .region(region)
  .https.onCall(patientController.updateSymptom);

exports.createReport = functions.region(region).https.onRequest(app);

// ******************************* unused ******************************************
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
