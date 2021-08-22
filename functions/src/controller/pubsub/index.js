const { admin, collection } = require("../../init");
const { getDateID } = require("../../utils/date");
const utils = require("./utils");
const { success } = require("../../response/success");
const { promises } = require("dns");

exports.updateTimeSeries = async () => {
  const id = getDateID();
  const snapshot = await admin
    .firestore()
    .collection(collection.timeSeries)
    .doc(id)
    .get();

    const [dropOffRate,btw36hrsto72hrs,activeUser] = await Promise.all([this.calculateDropOffRate(),utils.getnumberusersbtw36hrsto72hrs(),utils.getActiveUser()]);
  if (!snapshot.exists) {
    await snapshot.ref.create({ 
      r2ccount: 0,
      dropoffrate: dropOffRate,
      usersbtw36hrsto72hrs: btw36hrsto72hrs,
      activeUser: activeUser,
      terminateUser: 0
     });
  } else {
    await snapshot.ref.update({ 
      dropoffrate: dropOffRate,
      usersbtw36hrsto72hrs: btw36hrsto72hrs,
      activeUser: activeUser
     });
  }
};  
// exports.initializeR2CStat = async (_context) => {
//   const id = getDateID();
//   const snapshot = await admin
//     .firestore()
//     .collection(collection.r2cStat)
//     .doc(id)
//     .get();
//   if (!snapshot.exists) {
//     await snapshot.ref.create({ count: 0 });
//   }
// };

exports.calculateDropOffRate = async () => {
  const snapshot = await admin.firestore().collection(collection.patient).get();
  let totalPatientCount = 0;
  let totalDropOffDays = 0;
  let dropOffRate = 0;

  snapshot.forEach((doc) => {
    const patient = doc.data();
    const followUpCount = patient.followUp.length;
    // there must be more than one update in order to calculate drop off rate
    if (followUpCount > 0) {
      const lastUpdatedDate = patient.lastUpdatedAt.toDate();
      const notUpdatedPeriod = utils.calculateHours(
        new Date(),
        lastUpdatedDate
      );
      if (notUpdatedPeriod >= 72) {
        console.log("include - ", doc.id);
        totalPatientCount++;
        const firstDate = patient.createdDate.toDate();
        const dropOffHours = utils.calculateHours(lastUpdatedDate, firstDate);
        console.log(lastUpdatedDate, firstDate);
        console.log(dropOffHours);
        totalDropOffDays += dropOffHours / 24;
      }
    }
  });

  if (totalPatientCount > 0) {
    dropOffRate = totalDropOffDays / totalPatientCount;
  }

  return dropOffRate;
  // const id = getDateID();
  // const record = await admin
  //   .firestore()
  //   .collection(collection.dropOffStat)
  //   .doc(id)
  //   .get();
  // if (!record.exists) {
  //   record.ref.create({ rate: dropOffRate });
  // } else {
  //   console.log(`record id ${id} already exists`);
  //   console.log(record.data());
  // }
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

// exports.updatenumberuserbtw36hrsto72hrs = async () => {
//   const notUpdatedlistnumber = await utils.getnumberusersbtw36hrsto72hrs();
//   const id = getDateID();
//   const snapshot = await admin
//     .firestore()
//     .collection(collection.usersbtw36hrsto72hrs)
//     .doc(id)
//     .get();
//   if (!snapshot.exists) {
//     await snapshot.ref.create({ count: notUpdatedlistnumber });
//   }
//   // return(notUpdatedlistnumber);
// };

// exports.updateActiveUser = async () => {
//   const todayDate = getDateID();
//   // console.log(todayDate);
//   const snapshot = await admin.firestore().collection(collection.activeUser).doc(todayDate).get();
//   // console.log(snapshot);
//   if (!snapshot.exists) {
//     const dailyUser = await utils.getActiveUser();
//     const test = await snapshot.ref.create({active_patient: dailyUser})
//     // console.log(test)
//   }
//   return success();
// }
