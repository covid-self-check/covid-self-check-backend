import { admin, collection } from "../../init";
import { OnRunHandler } from "../../types";
import { getDateID } from "../../utils";
import * as utils from "./utils";

export const updateTimeSeries = async () => {
  const id = getDateID();
  const snapshot = await admin
    .firestore()
    .collection(collection.timeSeries)
    .doc(id)
    .get();

  const [dropOffRate, btw36hrsto72hrs, activeUser] = await Promise.all([
    calculateDropOffRate(),
    utils.getnumberusersbtw36hrsto72hrs(),
    utils.getActiveUser()
  ]);

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

export const calculateDropOffRate = async () => {
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
        totalPatientCount++;
        const firstDate = patient.createdDate.toDate();
        const dropOffHours = utils.calculateHours(lastUpdatedDate, firstDate);
        totalDropOffDays += dropOffHours / 24;
      }
    }
  });

  if (totalPatientCount > 0) {
    dropOffRate = totalDropOffDays / totalPatientCount;
  }

  return dropOffRate;
};

export const initializeLegacyStat: OnRunHandler = async (_context) => {
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


