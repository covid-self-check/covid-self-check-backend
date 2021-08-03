const { admin } = require("../init");
const { convertTZ } = require("./date");

const status = ["noSuggestion", "G1", "G2", "Y1", "Y2", "R1", "R2"];

/**
 *
 * @param {number} color
 */
const getPatientByStatus = async (color) => {
  if (color < 0 || color >= status.length) return [];

  const snapshot = await admin
    .firestore()
    .collection("patient")
    .where("status", "==", color)
    .get();

  const result = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    result.push([
      data.station,
      data.personalID,
      data.firstName,
      data.lastName,
      data.age,
      data.gender,
      data.height,
      convertTZ(data.lastUpdatedAt),
      data.hasHelper,
      data.address,
      data.district,
      data.prefecture,
      data.province,
    ]);
  });

  return result;
};

/**
 * convert data from
 * @param {[string]} headers
 * @param {*} snapshot
 * @returns
 */
exports.convertToAoA = (doc) => {
  const result = [];
  doc.forEach((data) => {
    let currentStatus = status[0];
    if (data.status >= 0 || data.status < status.length) {
      currentStatus = status[data.status];
    }

    result.push([
      data.station,
      data.personalID,
      data.firstName,
      data.lastName,
      data.age,
      data.gender,
      data.height,
      convertTZ(data.lastUpdatedAt),
      currentStatus,
      data.hasHelper,
      data.address,
      data.district,
      data.prefecture,
      data.province,
    ]);
  });

  return result;
};

exports.getNoSuggestPatient = () => {
  return getPatientByStatus(0);
};

exports.getY1Patient = () => {
  return getPatientByStatus(3);
};

exports.getY2Patient = () => {
  return getPatientByStatus(4);
};

/**
 * return true if patient is Y2 , false if not , null if there is no information
 */
exports.isY2 = (data) => {
  const { followUp } = data;
  const lastFollowUp = followUp[followUp.length - 1];
  if (!lastFollowUp || followUp.length === 0) {
    return null;
  }

  return (
    lastFollowUp.severeCough ||
    lastFollowUp.chestTightness ||
    lastFollowUp.poorAppetite ||
    lastFollowUp.fatigue ||
    lastFollowUp.persistentFever
  );
};

exports.isY1 = (snapshot) => {
  const lastFollowUp = snapshot.followUp[snapshot.lastFollowUp.length - 1];
  const isOld = snapshot.age > 60;
  const bmi = (snapshot.weight / (snapshot.height * snapshot.height)) * 10000;
  const hasCongenitalDisease =
    snapshot.COPD ||
    snapshot.chronicLungDisease ||
    snapshot.CKDStage3or4 ||
    snapshot.chronicHeartDisease ||
    snapshot.CVA ||
    snapshot.T2DM ||
    snapshot.cirrhosis ||
    snapshot.immunocompromise;
  const bmiExceed = bmi > 30;
  const isObese = snapshot.weight > 90;

  const isIll =
    lastFollowUp.tired ||
    lastFollowUp.cough ||
    lastFollowUp.diarrhea ||
    lastFollowUp.canNotSmell ||
    lastFollowUp.rash ||
    lastFollowUp.redEye;

  return isOld || hasCongenitalDisease || bmiExceed || isObese || isIll;
};

exports.isG1 = (snapshot) => {};
