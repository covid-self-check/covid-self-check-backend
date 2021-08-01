// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const { registerSchema } = require("./RegisterSchema");
const { authenticate } = require("./authentication");
const { admin, initializeApp } = require("./init");
const { region } = require("./config");
const { exportPatient } = require("./sheet");

// The Firebase Admin SDK to access Firestore.
initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions
  .region(region)
  .https.onRequest(async (req, res) => {
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

exports.registerParticipant = functions
  .region(region)
  .https.onCall(async (data, context) => {
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
    
    var needFollowUp = true;
    var status = "green";
    obj["status"] = status;
    obj["needFollowUp"] = needFollowUp;


    await admin.firestore().collection("patient").doc(personalID).set(obj);

    return { ok: true, id: `Registration with ID: ${personalID} added` };
  });

exports.thisEndpointNeedsAuth = functions.region(region).https.onCall(
  authenticate(async (data, context) => {
    return { result: `Content for authorized user` };
  })
);

exports.exportPatientData = functions
  .region(region)
  .firestore.document("patient/{id}")
  .onCreate(async (snapshot, _) => {
    const id = snapshot.id;

    const documentData = snapshot.data();
    console.log("Trigger create ");
    await exportPatient(id, documentData);
  });
