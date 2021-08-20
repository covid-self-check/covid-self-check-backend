const moment = require("moment");
const { admin } = require("../../init");
const { convertTZ } = require("../../utils");

exports.incrementR2CUser = async () => {
  const date = convertTZ(new Date(), "Asia/Bangkok");
  const id = moment(date).format("YYYY-MM-DD");

  const snapshot = await admin.firestore().collection("r2cStat").doc(id).get();

  if (!snapshot.exists) {
    return snapshot.ref.create({ count: 1 });
  } else {
    return snapshot.ref.update(
      "count",
      admin.firestore.FieldValue.increment(1)
    );
  }
};

exports.getDateID = () => {
  const date = convertTZ(new Date(), "Asia/Bangkok");
  return moment(date).format("YYYY-MM-DD");
};
