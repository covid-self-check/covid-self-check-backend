const moment = require("moment");
const { admin } = require("../../init");
const { getDateID } = require("./utils");

exports.initializeR2CStat = async (_context) => {
  const id = getDateID();
  const snapshot = await admin.firestore().collection("r2cStat").doc(id).get();
  if (!snapshot.exists) {
    await snapshot.ref.create({ count: 0 });
  }
};
