"use strict";
// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
exports.initializeApp = function () {
  admin.initializeApp();
};
exports.admin = admin;
//# sourceMappingURL=init.js.map
