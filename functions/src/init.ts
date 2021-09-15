// The Firebase Admin SDK to access Firestore.
import * as admin from "firebase-admin";

export const initializeApp = () => {
  admin.initializeApp();
};



export const collection = {
  patient: "patient",
  r2rAssistance: "requestToRegisterAssistance",
  userCount: "userCount",
  legacyUser: "legacyUser",
  whitelist: "whitelist",
  legacyStat: "legacyStat",
  timeSeries: "timeSeries"
};

export { admin }

