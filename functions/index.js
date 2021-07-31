// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const { registerSchema } = require("./RegisterSchema");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

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
