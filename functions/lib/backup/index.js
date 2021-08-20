"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("../init");
const date_1 = require("../utils/date");
const lodash_1 = require("lodash");
const functions = require("firebase-functions");
const index_1 = require("../config/index");
const googleapis_1 = require("googleapis");
const privateKey = lodash_1.replace(
  index_1.config.backupAccount.privateKey,
  /\\n/g,
  "\n"
);
const isDevelopment =
  functions.config().environment &&
  functions.config().environment.isdevelopment;
const authClient = new googleapis_1.google.auth.JWT({
  email: index_1.config.backupAccount.clientEmail,
  key: privateKey,
  scopes: [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});
const authPromise = authClient.authorize();
const firestoreClient = googleapis_1.google.firestore({
  version: "v1beta2",
  auth: authClient,
});
exports.backup = async (context) => {
  if (isDevelopment) return;
  // TODO: get project ID from env
  const projectId = init_1.admin.instanceId().app.options.projectId;
  const timestamp = date_1.convertTZ(new Date(), "Asia/Bangkok").toISOString();
  console.log(`Start to backup project ${projectId}`);
  await authPromise;
  return firestoreClient.projects.databases.exportDocuments({
    name: `projects/${projectId}/databases/(default)`,
    requestBody: {
      outputUriPrefix: `gs://${projectId}-firestore-backup/backups/${timestamp}`,
    },
  });
};
//# sourceMappingURL=index.js.map
