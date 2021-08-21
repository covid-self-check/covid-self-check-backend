const { admin, collection } = require("../../init");
const { getDateID } = require("../../utils/date");

exports.incrementR2CUser = async () => {
  const id = getDateID();

  const snapshot = await admin
    .firestore()
    .collection(collection.timeSeries)
    .doc(id)
    .get();

  if (!snapshot.exists) {
    return snapshot.ref.update({ r2ccount: 1 });
  } else {
    return snapshot.ref.update(
      "r2ccount",
      admin.firestore.FieldValue.increment(1)
    );
  }
};

exports.incrementLegacyUser = async () => {
  const snapshot = await admin
    .firestore()
    .collection(collection.legacyStat)
    .doc("stat")
    .get();

  if (!snapshot.exists) {
    return snapshot.ref.create({ count: 1 });
  } else {
    return snapshot.ref.update(
      "count",
      admin.firestore.FieldValue.increment(1)
    );
  }
};
