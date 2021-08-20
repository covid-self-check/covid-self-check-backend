const { admin, collection } = require("../../init");

exports.incrementLegacyUser = async () => {
  const snapshot = await admin
    .firestore()
    .collection(collection.legacyStat)
    .doc("stat")
    .get();
  return snapshot.ref.update("count", admin.firestore.FieldValue.increment(1));
};
