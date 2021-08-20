const { admin, collection } = require("../../init");
const { getDateID } = require("../../utils/date");
const utils = require("./utils");

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

exports.calculateDropOffRate = async (_data, _context) => {
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

  const id = getDateID();
  const record = await admin
    .firestore()
    .collection(collection.dropOffStat)
    .doc(id)
    .get();
  if (!record.exists) {
    record.ref.create({ rate: dropOffRate });
  } else {
    console.log(`record id ${id} already exists`);
    console.log(record.data());
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
