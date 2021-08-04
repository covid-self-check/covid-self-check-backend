const { admin } = require("../init");
const { convertTZ } = require("../utils/date");
const _ = require("lodash");

const { config } = require("../config/index");

const { google } = require("googleapis");

const privateKey = _.replace(config.backupAccount.privateKey, /\\n/g, "\n");

const authClient = new google.auth.JWT({
  email: config.backupAccount.clientEmail,
  key: privateKey,
  scopes: [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});
const authPromise = authClient.authorize();

const firestoreClient = google.firestore({
  version: "v1beta2",
  auth: authClient,
});

exports.backup = async (context) => {
  // TODO: get project ID from env
  const projectId = admin.instanceId().app.options.projectId;

  const timestamp = convertTZ(new Date(), "Asia/Bangkok").toISOString();

  console.log(`Start to backup project ${projectId}`);
  await authPromise;
  return firestoreClient.projects.databases.exportDocuments({
    name: `projects/${projectId}/databases/(default)`,
    requestBody: {
      outputUriPrefix: `gs://${projectId}-firestore-backup/backups/${timestamp}`,
    },
  });
};
