// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");

exports.initializeApp = function () {
  admin.initializeApp();
};

exports.admin = admin;

exports.collection = {
  patient: "patient",
  r2rAssistance: "requestToRegisterAssistance",
  r2cStat: "r2cStat",
  userCount: "userCount",
  legacyUser: "legacyUser",
  whitelist: "whitelist",
  dropOffStat: "dropOffStat",
};
