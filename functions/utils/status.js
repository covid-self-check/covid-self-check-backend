exports.makeStatusPayload = (data) => {
  const { followUp } = data;
  const lastFollowUp = followUp[followUp.length - 1];
  const age60 = data.age > 60;
  const copd = data.COPD;
  const ckd34 = data.CKDStage3or4;
  const chronicHeartDisease = data.chronicHeartDisease;
  const CVA = data.CVA;
  const T2DM = data.T2DM;
  const bmi = (data.weight * 10000) / (data.height * data.height);
  const bmiOver30 = bmi > 30 || data.weight > 90;
  const cirrhosis = data.cirrhosis;
  const immunocompromise = data.immunocompromise;

  const payload = {
    cid: data.personalId,
    Firstname: data.firstName,
    Lastname: data.lastName,
    contact_number: data.personalPhoneNo,
    age: data.age,
    gender: data.gender,
    height: data.height,
    weight: data.weight,
    infected_discover_date: data.infectedDiscoverDate, //To be implemented
    sp_o2: lastFollowUp.sp_o2,
    sp_o2_ra: lastFollowUp.sp_o2_ra,
    sp_o2_after_eih: null, //can this even be null?
    eih_result: "unknown",
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
    fac_diabetes: lastFollowUp.fac_diabetes,
    fac_dyslipidemia: lastFollowUp.fac_dyslipidemia,
    fac_hypertension: lastFollowUp.fac_hypertension,
    fac_heart_diseases: lastFollowUp.fac_heart_diseases,
    fac_esrd: lastFollowUp.fac_esrd,
    fac_cancer: lastFollowUp.fac_cancer,
    fac_tuberculosis: lastFollowUp.fac_tuberculosis,
    fac_hiv: lastFollowUp.fac_hiv,
    fac_asthma: lastFollowUp.fac_asthma,
    fac_pregnancy: lastFollowUp.fac_pregnancy,
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
