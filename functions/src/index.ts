// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from "firebase-functions";
import {
  authenticateVolunteer,
} from "./middleware/authentication";
import { admin, initializeApp } from "./init";
import { eventHandler } from "./handler/eventHandler";
// const line = require("@line/bot-sdk");
import * as line from "@line/bot-sdk"
import config from "./config"
import { success } from "./response/success";
import * as  express from "express";
import * as cors from "cors";
import {
  patientController,
  pubsub,
  firestoreController,
  dashboard
} from "./controller";
import { Series, UserObject } from "./types";
const client = new line.Client({
  channelAccessToken: config.line.channelAccessToken,
  channelSecret: config.line.channelSecret

});
const region = config.region
const app = express();
app.use(cors({ origin: true }));


initializeApp();

export const webhook = functions.region(region).https.onRequest(async (req, res) => {
  res.sendStatus(200);
  try {
    const { events } = (req.body as line.WebhookRequestBody)
    const event = events[0]
    const userId = event.source.userId;
    if (!userId) {
      throw new Error('userId not found')
    }

    const profile: line.Profile = await client.getProfile(userId);
    const userObject: UserObject = { userId: userId, profile: profile };
    await eventHandler(event, userObject, client);
  } catch (err) {
    console.error(err);
    console.log("Not from line application.");
  }
});

export const deletePatient = functions
  .region(region)
  .https.onCall(authenticateVolunteer(patientController.requestDeletePatient));

export const getProfile = functions
  .region(region)
  .https.onCall(patientController.getProfileHandler);

export const accumulativeData = functions
  .region(region)
  .https.onCall(authenticateVolunteer(dashboard.getAccumulative));

export const resetUserCount = functions
  .region(region)
  .https.onCall(authenticateVolunteer(dashboard.resetUserCount));

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


export const check = functions.region(region).https.onRequest(async (req, res) => {
  res.sendStatus(200);
});


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
  .https.onCall(patientController.getFollowupHistory);





