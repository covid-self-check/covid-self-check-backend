const { admin } = require("../init");

// TODO: add credential
const { config } = require("../config/index");

const { google } = require("googleapis");

const authClient = new google.auth.JWT({
  email: config.backupAccount.clientId,
  key: config.backupAccount.privateKey,
  scopes: [
    "https://www.googleapis.com/auth/datastore",
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});

const firestoreClient = google.firestore({
  version: "v1beta2",
  auth: authClient,
});

exports.backup = async (context) => {
  // TODO: get project ID from env
  const projectId = admin.instanceId().app.options.projectId;

  const timestamp = new Date().toISOString();

  console.log(`Start to backup project ${projectId}`);

  return firestoreClient.projects.databases.exportDocuments({
    name: `projects/${projectId}/databases/(default)`,
    requestBody: {
      outputUriPrefix: `gs://${projectId}-firestore-backup/backups/${timestamp}`,
    },
  });
};
