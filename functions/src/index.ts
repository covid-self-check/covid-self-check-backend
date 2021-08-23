// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from "firebase-functions";
import {
  authenticateVolunteer,
  getProfile as getLineProfile,
  authenticateVolunteerRequest,
} from "./middleware/authentication";
import { admin, initializeApp } from "./init";
import { eventHandler } from "./handler/eventHandler";
// const line = require("@line/bot-sdk");
import * as line from "@line/bot-sdk"
import config from "./config"
import { validateGetProfileSchema } from "./schema";
import { success } from "./response/success";
import * as  express from "express";
import * as cors from "cors";
import { backup } from "./backup";
import {
  exportController,
  patientController,
  requestController,
  importController,
  pubsub,
  firestoreController,
  dashboard
} from "./controller";
import { Patient, Series } from "./types";
const client = new line.Client({
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret

});
const region = config.region
const app = express();
app.use(cors({ origin: true }));

// The Firebase Admin SDK to access Firestore.
initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original

// app.get("/master", exportController.exportMasterAddress);

// app.get("/patient", exportController.exportAllPatient);

// app.get(
//   "/",
//   exportController.exportPatientForNurse
// );

export const exportNurse = functions
  .region(region)
  .https.onRequest(authenticateVolunteerRequest(exportController.exportPatientForNurse))



export const webhook = functions.region(region).https.onRequest(async (req, res) => {
  res.sendStatus(200);
  try {
    const event = req.body.events[0];
    const userId = event.source.userId;
    const profile: any = await client.getProfile(userId);
    const userObject = { userId: userId, profile: profile };
    console.log(userObject);
    // console.log(event)
    await eventHandler(event, userObject, client);
  } catch (err) {
    console.error(err);
    console.log("Not from line application.");
  }
});

export const deletePatient = functions
  .region(region)
  .https.onCall(authenticateVolunteer(patientController.requestDeletePatient));

export const registerParticipant = functions
  .region(region)
  .https.onCall(patientController.registerPatient);

export const getProfile = functions
  .region(region)
  .https.onCall(patientController.getProfileHandler);

export const exportRequestToRegister = functions
  .region(region)
  .https.onCall(authenticateVolunteer(exportController.exportR2R));
export const export36hrs = functions
  .region(region)
  .https.onCall(authenticateVolunteer(exportController.export36hrs));

export const exportRequestToCall = functions
  .region(region)
  .https.onCall(authenticateVolunteer(exportController.exportR2C));

export const exportRequestToCallDayOne = functions
  .region(region)
  .https.onCall(
    authenticateVolunteer(exportController.exportRequestToCallDayOne)
  );

export const importFinishedRequestToCall = functions
  .region(region)
  .https.onCall(authenticateVolunteer(importController.importFinishR2C));
export const importFinishedRequestToRegister = functions
  .region(region)
  .https.onCall(authenticateVolunteer(importController.importFinishR2R));
export const importWhitelist = functions
  .region(region)
  .https.onCall(authenticateVolunteer(importController.importWhitelist));

export const thisEndpointNeedsAuth = functions.region(region).https.onCall(
  authenticateVolunteer(async (data: any, context: functions.https.CallableContext) => {
    return { result: `Content for authorized user` };
  })
);

export const accumulativeData = functions
  .region(region)
  .https.onCall(authenticateVolunteer(dashboard.getAccumulative));

export const backupFirestore = functions
  .region(region)
  .pubsub.schedule("every day 18:00")
  .timeZone("Asia/Bangkok")
  .onRun(backup);

export const updateTimeSeries = functions
  .region(region)
  .pubsub.schedule("every day 23:59")
  .timeZone("Asia/Bangkok")
  .onRun(pubsub.updateTimeSeries);

export const initializeLegacyStat = functions
  .region(region)
  .pubsub.schedule("every day 00:00")
  .timeZone("Asia/Bangkok")
  .onRun(pubsub.initializeLegacyStat);

export const getNumberOfPatients = functions
  .region(region)
  .https.onRequest(async (req, res) => {
    const snapshot = await admin.firestore().collection("patient").get();

    res.status(200).json(success(snapshot.size));
  });

export const getNumberOfPatientsV2 = functions
  .region(region)
  .https.onRequest(async (req, res) => {
    const snapshot = await admin
      .firestore()
      .collection("userCount")
      .doc("users")
      .get();
    const data = snapshot.data() as Series
    res.status(200).json(success(data.count));
  });

export const requestToRegister = functions
  .region(region)
  .https.onCall(requestController.requestToRegister);

export const check = functions.region(region).https.onRequest(async (req, res) => {
  res.sendStatus(200);
});

export const requestToCall = functions
  .region(region)
  .https.onCall(requestController.requestToCall);

export const updateSymptom = functions
  .region(region)
  .https.onCall(patientController.updateSymptom);

export const createReport = functions.region(region).https.onRequest(app);

export const onRegisterPatient = functions
  .region(region)
  .firestore.document("patient/{id}")
  .onCreate(firestoreController.onRegisterPatient)

export const onUpdateSymptom = functions
  .region(region)
  .firestore.document("patient/{id}")
  .onUpdate(firestoreController.onUpdatePatient)

export const onDeletePatient = functions
  .region(region)
  .firestore.document("patient/{id}")
  .onDelete(firestoreController.onDeletePatient)

// ******************************* unused ******************************************
export const getFollowupHistory = functions
  .region(region)
  .https.onCall(async (data, context) => {
    const { value, error } = validateGetProfileSchema(data);
    if (error) {
      console.log(error.details);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }
    const { lineUserID, lineIDToken, noAuth } = value;
    const { data: errorData, error: authError } = await getLineProfile({
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
    const patient = snapshot.data() as Patient
    return success(patient.followUp);
  });

export const fetchYellowPatients = functions
  .region(region)
  .https.onCall(async (data) => {
    // const snapshot = await admin
    //   .firestore()
    //   .collection("patient")
    //   .where("status", "==", data.status)
    //   .get();

    // var patientList = [];

    // snapshot.forEach((doc) => {
    //   const data = doc.data();
    //   patientList.push(data);
    // });
    // return success(patientList);
    return success();
  });

export const fetchGreenPatients = functions
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
export const fetchRedPatients = functions
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
