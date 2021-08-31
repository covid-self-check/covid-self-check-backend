import { admin } from "../init";
import { convertTZ } from "../utils/date";
import { replace } from "lodash";
import * as functions from "firebase-functions";

import config from "../config";

import { google } from "googleapis";
import { OnRunHandler } from "../types";

const privateKey = replace(config.backupAccount.privateKey, /\\n/g, "\n");
const isDevelopment =
  functions.config().environment &&
  functions.config().environment.isdevelopment;
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

export const backup: OnRunHandler = async (_context) => {
  if (isDevelopment) return;
  const projectId = admin.instanceId().app.options.projectId;

  const timestamp = convertTZ(new Date()).toISOString();

  console.log(`Start to backup project ${projectId}`);
  await authPromise;
  return firestoreClient.projects.databases.exportDocuments({
    name: `projects/${projectId}/databases/(default)`,
    requestBody: {
      outputUriPrefix: `gs://${projectId}-firestore-backup/backups/${timestamp}`,
    },
  });
};
