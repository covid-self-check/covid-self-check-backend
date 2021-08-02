// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const { authenticate } = require("./middleware/authentication");
const { admin, initializeApp } = require("./init");
const { region } = require("./config");
const { exportPatient, convertTZ } = require("./utils");
const { historySchema , registerSchema } = require("./schema");
const { success } = require("./response/success");


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
      console.log(error.details);
      throw new functions.https.HttpsError(
        "failed-precondition",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }
    const { lineId , ...obj } = value;
    
    var needFollowUp = true;
    var status = "green";
    obj["status"] = status;
    obj["needFollowUp"] = needFollowUp;
    obj["followUp"] = [];
    const createdDate = convertTZ(new Date(),'Asia/Bangkok');
    obj["createdDate"] = admin.firestore.Timestamp.fromDate(createdDate);


    const snapshot = await admin.firestore().collection("patient").doc(lineId).get();

    if(snapshot.exists){
      throw new functions.https.HttpsError(
        "already-exists",
        `มีข้อมูลผู้ใช้ ${lineId} ในระบบแล้ว`
      )
    }

    await snapshot.ref.create(obj)

    return success(`Registration with ID: ${lineId} added`);
  });

exports.thisEndpointNeedsAuth = functions.region(region).https.onCall(
  authenticate(async (data, context) => {
    return { result: `Content for authorized user` };
  })
);

exports.getFollowup = functions.https.onCall(async(data,context)=>{
    const { lineId } = data;

    // const snapshot = await admin.firestore().collection('followup').where("personalId","==","1").get()
    const snapshot = await admin.firestore()
      .collection("patient")
      .doc(lineId)
      .get();

    if(!snapshot.exists){
      throw new functions.https.HttpsError(
        "not-found",
        `ไม่พบข้อมูลผู้ใช้ ${lineId}`
      );
    }
    return success(snapshot.data().followUp);    
})

exports.exportPatientData = functions
  .region(region)
  .firestore.document("patient/{id}")
  .onCreate(async (snapshot, _) => {
    const id = snapshot.id;

    const documentData = snapshot.data();
    console.log("Trigger create ");
    await exportPatient(id, documentData);
  });

exports.updateSymptom = functions
  .region(region)
  .https.onCall(async ( data ) => {
    const { value, error} = historySchema.validate(data);
    if(error){
      // DEBUG
      console.log(error.details);
      throw new functions.https.HttpsError(
        "failed-precondition",
        "ข้อมูลไม่ถูกต้อง",
        error.details
      );
    }

    const { lineId, ...obj } = value;
    
    const createdDate = convertTZ(new Date(),'Asia/Bangkok');
    obj.createdDate = admin.firestore.Timestamp.fromDate(createdDate);

    const snapshot = await admin.firestore().collection("patient").doc(lineId).get();
    if(!snapshot.exists){
      throw new functions.https.HttpsError(
        "not-found",
        `ไม่พบผู้ใช้ ${lineId}`
      );
    }

    const { followUp } = snapshot.data();
    
    if(!followUp){
      await snapshot.ref.set({ followUp : [obj] })
    } else {
      await snapshot.ref.update({
        followUp : admin.firestore.FieldValue.arrayUnion(obj)
      });
    }
    
    return success();

  });
