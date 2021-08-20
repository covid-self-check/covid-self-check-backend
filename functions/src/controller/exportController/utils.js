const { admin, collection } = require("../../init");
const { statusList } = require("../../api/const");

exports.getUnExportedR2RUsers = () => {
  return admin
    .firestore()
    .collection(collection.r2rAssistance)
    .where("isR2RExported", "==", false)
    .get();
};

/**
 * marked users from R2R collection as exported
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns
 */
exports.serializeData = (snapshot) => {
  const result = [];
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    result.push(data);
  });

  return result;
};

/**
 * marked users from R2R collection as exported
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns
 */
exports.updateExportedR2RUsers = (snapshot) => {
  return Promise.all(
    snapshot.docs.map((doc) => {
      const ref = admin
        .firestore()
        .collection(collection.r2rAssistance)
        .doc(doc.id);

      return ref.update({
        isR2RExported: true,
      });
    })
  );
};

exports.getUnExportedR2CUsers = () => {
  return admin
    .firestore()
    .collection(collection.patient)
    .where("isRequestToCall", "==", true)
    .where("isRequestToCallExported", "==", false)
    .orderBy("lastUpdatedAt")
    .get();
};

exports.get36hrsUsers = async () => {
  const snapshot = await admin.firestore().collection(collection.patient).get();

  var notUpdatedList = [];
  const currentDate = new Date();
  snapshot.forEach((doc) => {
    const patient = doc.data();

    const lastUpdatedDate = patient.lastUpdatedAt.toDate();
    var hours = Math.abs(currentDate - lastUpdatedDate) / 36e5;
    const includeStatus = [
      statusList["unknown"],
      statusList["G1"],
      statusList["G2"],
    ];

    if (includeStatus.includes(patient.status)) {
      if (hours >= 36 && hours < 72) {
        notUpdatedList.push({
          firstName: patient.firstName,
          personalPhoneNo: patient.personalPhoneNo,
        });
      }
    }
  });
  return notUpdatedList;
};


exports.getnumber36hrsUsers = async() => {
  const temp_notUpdatedList = await this.get36hrsUsers();
  return temp_notUpdatedList.length;
}


/**
 * marked users from R2C collection as exported and return serialized data
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns serialized snapshot data
 */
exports.updateAndSerializeR2CData = async (snapshot) => {
  const patientList = [];
  await Promise.all(
    snapshot.docs.map((doc) => {
      // WARNING SIDE EFFECT inside map
      const data = doc.data();
      const dataResult = this.makeR2CPayload(doc.id, data);
      patientList.push(dataResult);
      // end of side effects

      this.updateExportedR2CUser(doc.id);
    })
  );

  return patientList;
};

exports.makeR2CPayload = (id, data) => {
  return {
    id,


    firstName: data.firstName,
    lastName: data.lastName,
    hasCalled: 0,
    personalPhoneNo: data.personalPhoneNo,
  };
};

exports.updateExportedR2CUser = (id) => {
  const ref = admin.firestore().collection(collection.patient).doc(id);

  ref.update({
    isRequestToCallExported: true,
  });
};

exports.formatterR2R = (doc) => [doc.id, doc.name, doc.personalPhoneNo];

exports.formatterR2C = (doc) => [
  doc.id,
  doc.firstName,
  doc.hasCalled,
  `="${doc.personalPhoneNo}"`,
];
