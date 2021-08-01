// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const { registerSchema } = require("./RegisterSchema");
const { authenticate } = require("./authentication");
const { admin, initializeApp } = require("./init");
const { spreadsheetId, serviceAccount } = require("./config");
const { google } = require("googleapis");
const sheets = google.sheets("v4");
const _ = require("lodash");

const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const jwtAuthPromise = jwtClient.authorize();

// The Firebase Admin SDK to access Firestore.
initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.registerParticipant = functions.https.onCall(async (data, context) => {
  const { value, error } = registerSchema.validate(data);

  if (error) {
    // DEBUG
    console.log(error.details);
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { personalID, ...obj } = value;
  await admin.firestore().collection("patient").doc(personalID).set(obj);

  return { ok: true, id: `Registration with ID: ${personalID} added` };
});

exports.thisEndpointNeedsAuth = functions.https.onCall(
  authenticate(async (data, context) => {
    return { result: `Content for authorized user` };
  })
);

exports.SyncToSheets = functions
  .firestore()
  .collection("patient")
  .onUpdate(async (change) => {
    const jsonData = change.after.val();

    await jwtAuthPromise;

    const flatten = (data) => {
      var result = {};
      const recurse = function (cur, prop) {
        if (Object(cur) !== cur) {
          result[prop] = cur;
        } else if (Array.isArray(cur)) {
          for (var i = 0, l = cur.length; i < l; i++)
            recurse(cur[i], prop + "[" + i + "]");
          if (l === 0) result[prop] = [];
        } else {
          var isEmpty = true;
          for (var p in cur) {
            isEmpty = false;
            recurse(cur[p], prop ? prop + "." + p : p);
          }
          if (isEmpty && prop) result[prop] = {};
        }
      };
      recurse(data, "");
      return result;
    };

    let allKeys = Object.keys(jsonData);

    let firstElement = allKeys[0] || 0;

    let headerData = flatten(jsonData[firstElement]);
    let keys = Object.keys(headerData);

    let rows = [];

    for (const item in jsonData) {
      let val = jsonData[item];
      let row = [item];
      keys.forEach((key) => {
        row.push(_.get(val, key) || "");
      });
      rows.push(row);
    }

    let sheetData = [["id", ...keys], ...rows];

    let range = `Products!A1:${String.fromCharCode(65 + keys.length)}${
      allKeys.length + 1
    }`;

    await sheets.spreadsheets.values.update(
      {
        auth: jwtClient,
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: "RAW",
        requestBody: { values: sheetData },
      },
      {}
    );
  });
