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
