const { admin, collection } = require("../../init");
const { getDateID } = require("../../utils/date");

exports.incrementR2CUser = async () => {
  const id = getDateID();

  const snapshot = await admin
    .firestore()
    .collection(collection.r2cStat)
    .doc(id)
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
