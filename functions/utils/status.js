const status = {
  noSuggestion: 0,
  G1: 1,
  G2: 2,
  Y1: 3, // เหลืองไม่มีอาการ
  Y2: 4, // เหลืองมีอาการ
  R1: 5,
  R2: 6,
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
