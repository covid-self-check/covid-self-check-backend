const { admin, collection } = require("../../init");
const { getDateID } = require("../../utils/date");

exports.initializeR2CStat = async (_context) => {
  const id = getDateID();
  const snapshot = await admin
    .firestore()
    .collection(collection.r2cStat)
    .doc(id)
    .get();
  if (!snapshot.exists) {
    await snapshot.ref.create({ count: 0 });
  }
};
exports.initializeLegacyStat = async (_context) => {
  const snapshot = await admin
    .firestore()
    .collection(collection.legacyUser)
    .get();

  await admin
    .firestore()
    .collection(collection.legacyStat)
    .doc("stat")
    .set({ count: snapshot.docs.length });
};
