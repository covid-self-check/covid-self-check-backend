const { admin } = require("../../init");

const R2R_COLLECTION = "requestToRegisterAssistance";

exports.getR2RUsers = () => {
  return admin
    .firestore()
    .collection(R2R_COLLECTION)
    .where("isR2RExported", "==", false)
    .get();
};

/**
 * marked users from R2R collection as exported
 * @param {FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>} snapshot
 * @returns
 */
exports.updateExportedR2RUsers = (snapshot) => {
  return Promise.all(
    snapshot.docs.map((doc) => {
      const ref = admin.firestore().collection(R2R_COLLECTION).doc(doc.id);

      return ref.update({
        isR2RExported: true,
      });
    })
  );
};
