const { admin } = require("../init");
const { generateZipFileRoundRobin } = require("../utils/zip");
const { exportRequestToCallSchema } = require("../schema");

exports.exportR2R = async (data, context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize } = value;
  const userList = [];

  const snapshot = await admin
    .firestore()
    .collection("requestToRegisterAssistance")
    .where("isRequestToCallRegister", "==", false)
    .get();

  snapshot.docs.forEach((doc) => {
    userList.push(doc.data());
  });

  const header = ["name", "tel"];
  const result = await generateZipFileRoundRobin(
    volunteerSize,
    userList,
    header,
    (doc) => [doc.name, doc.personalPhoneNo]
  );
  await Promise.all(
    snapshot.docs.map((doc) => {
      console.log(doc.id);
      const docRef = admin
        .firestore()
        .collection("requestToRegisterAssistance")
        .doc(doc.id);

      return docRef.update({
        isRequestToCallRegister: true,
      });
    })
  );

  return result;
};

exports.exportR2C = async (data, context) => {
  const { value, error } = exportRequestToCallSchema.validate(data);
  if (error) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "ข้อมูลไม่ถูกต้อง"
    );
  }
  const { volunteerSize } = value;
  const patientList = [];

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", false)
    .orderBy("lastUpdatedAt")
    .get();

  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const docData = doc.data();
      const dataResult = {
        firstName: docData.firstName,
        lastName: docData.firstName,
        hasCalled: 0,
        id: doc.id,
        personalPhoneNo: docData.personalPhoneNo,
      };
      patientList.push(dataResult);
      // end of side effects

      const docRef = admin.firestore().collection("patient").doc(doc.id);
      docRef.update({
        isRequestToCallExported: true,
      });
    })
  );

  return generateZipFileRoundRobin(
    volunteerSize,
    patientList,
    headers,
    (doc) => [doc.id, doc.firstName, doc.hasCalled, `="${doc.personalPhoneNo}"`]
  );
};
