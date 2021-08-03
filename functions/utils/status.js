exports.makeStatusPayload = (data) => {
  const { followUp } = data;
  const lastFollowUp = followUp[followUp.length - 1];
  const age60 = data.age > 60;
  const copd = data.rf_copd_chronic_lung_disease;
  const ckd34 = data.rf_ckd_stagr_3_to_4;
  const chronicHeartDisease = data.rf_chronic_heart_disease;
  const CVA = data.rf_cva;
  const T2DM = data.rf_t2dm;
  const bmi = (data.weight * 10000) / (data.height * data.height);
  const bmiOver30 = bmi > 30 || data.weight > 90;
  const cirrhosis = data.rf_cirrhosis;
  const immunocompromise = data.rf_immunocompromise;

  const payload = {
    //passport:"", length is 7 or 8 or 9
    cid: data.personalId,
    firstname: data.firstName,
    lastname: data.lastName,
    contact_number: data.personalPhoneNo,
    age: data.age,
    gender: data.gender,
    height: data.height,
    weight: data.weight,
    infected_discover_date: data.infectedDiscoverDate, //To be implemented

    sp_o2: lastFollowUp.sp_o2,
    sp_o2_ra: lastFollowUp.sp_o2_ra,
    sp_o2_after_eih: lastFollowUp.sp_o2_after_eih, //can this even be null?
    eih_result: lastFollowUp.eih_result,

    sym1_severe_cough: lastFollowUp.sym1_severe_cough,
    sym1_chest_tightness: lastFollowUp.sym1_chest_tightness,
    sym1_poor_appetite: lastFollowUp.sym1_poor_appetite,
    sym1_fatigue: lastFollowUp.sym1_fatigue,
    sym1_persistent_fever: lastFollowUp.sym1_persistent_fever,

    rf_age_60: age60,
    rf_copd_chronic_lung_disease: copd,
    rf_ckd_stage_3_to_4: ckd34,
    rf_chronic_heart_disease: chronicHeartDisease,
    rf_cva: CVA,
    rf_t2dm: T2DM,
    rf_bmi_over_30_or_bw_over_90: bmiOver30,
    rf_cirrhosis: cirrhosis,
    rf_immunocompromise: immunocompromise,

    sym2_tired_body_ache: lastFollowUp.sym2_tired_body_ache,
    sym2_cough: lastFollowUp.sym2_cough,
    sym2_fever: lastFollowUp.sym2_fever,
    sym2_liquid_stool: lastFollowUp.sym2_liquid_stool,
    sym2_cannot_smell: lastFollowUp.sym2_cannot_smell,
    sym2_rash: lastFollowUp.sym2_rash,
    sym2_red_eye: lastFollowUp.sym2_red_eye,

    fac_diabetes: data.fac_diabetes,
    fac_dyslipidemia: data.fac_dyslipidemia,
    fac_hypertension: data.fac_hypertension,
    fac_heart_diseases: data.fac_heart_diseases,
    fac_esrd: data.fac_esrd,
    fac_cancer: data.fac_cancer,
    fac_tuberculosis: data.fac_tuberculosis,
    fac_hiv: data.fac_hiv,
    fac_asthma: data.fac_asthma,
    fac_pregnancy: data.fac_pregnancy,

    fac_bed_ridden_status: lastFollowUp.fac_bed_ridden_status,
    fac_uri_symptoms: lastFollowUp.fac_uri_symptoms,
    fac_olfactory_symptoms: lastFollowUp.fac_olfactory_symptoms,
    fac_diarrhea: lastFollowUp.fac_diarrhea,
    fac_dyspnea: lastFollowUp.fac_dyspnea,
    fac_chest_discomfort: lastFollowUp.fac_chest_discomfort,
    fac_gi_symptomss: lastFollowUp.fac_gi_symptomss,
  };

  return payload;
};
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
