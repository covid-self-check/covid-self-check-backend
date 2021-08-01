// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const { registerSchema } = require("./RegisterSchema");
const { authenticate } = require("./authentication");
const { admin, initializeApp } = require("./init");

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

exports.addFollowup = functions.https.onCall(async (data, context) => {
    // Grab the text parameter.
   const original = data;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await admin.firestore().collection('followup').doc(data.personalId).set({ 
        bodyTemperature: original.bodyTemperature,
        personalId: original.personalId ,
        pulse: original.pulse,
        spO2: original.spO2
    });
    // Send back a message that we've successfully written the message
   
   return { result: `Message with ID: ${data.personalId} added.` };

});

exports.getFollowup = functions.https.onCall(async(data,context)=>{
    const snapshot = await admin.firestore().collection('followup').where("personalId","==","1").get()
    var t;
    snapshot.docs.forEach(doc =>{
        console.log(doc.data())
        t = doc.data()
        
    })
    return t


    
})