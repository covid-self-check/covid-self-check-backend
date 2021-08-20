const utils = require("./utils");
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

exports.updatenumberuserbtw36hrsto72hrs = async () => {
  const notUpdatedlistnumber =  await utils.getnumberusersbtw36hrsto72hrs();
  const id = getDateID();
  const snapshot = await admin
    .firestore()
    .collection(collection.usersbtw36hrsto72hrs)
    .doc(id)
    .get();
  if (!snapshot.exists) {
    await snapshot.ref.create({ count: notUpdatedlistnumber });
  }
  // return(notUpdatedlistnumber);
}


