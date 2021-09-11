import * as Joi from 'joi';

export const HistorySchema = Joi.object({
  lineIDToken: Joi.string().required(),
  lineUserID: Joi.string().required(),

  //----For API uses----

  //----Already in Register----
  //cid
  //Firstname
  //Lastname
  //contact_number
  //age
  //gender
  //height
  //weight
  //infected discover date
  age: Joi.number().required(),
  weight: Joi.number().required(),
  height: Joi.number().required(),
  gender: Joi.string().valid("male", "female", "unknown").required(),
  sp_o2: Joi.number().default(100),
  sp_o2_ra: Joi.number().default(100),
  sp_o2_after_eih: Joi.number().default(100),
  eih_result: Joi.string()
    .allow("positive", "negative", "neutral", "unknown")
    .required(),
  sym1_severe_cough: Joi.number().allow(0, 1).required(),
  sym1_chest_tightness: Joi.number().allow(0, 1).required(),
  sym1_poor_appetite: Joi.number().allow(0, 1).required(),
  sym1_fatigue: Joi.number().allow(0, 1).required(),
  sym1_persistent_fever: Joi.number().allow(0, 1).required(),

  //----Need to add by Backend----
  //rf_age_60
  //rf_copd_chronic_lung_disease
  // rf_ckd_stage_3_to_4
  // rf_chronic_heart_disease
  // rf_cva
  // rf_t2dm
  // rf_bmi_over_30_or_bw_over_90
  // rf_cirrhosis
  // rf_immunocompromise
  sym2_tired_body_ache: Joi.number().allow(0, 1).required(),
  sym2_cough: Joi.number().allow(0, 1).required(),
  sym2_fever: Joi.number().allow(0, 1).required(),
  sym2_liquid_stool: Joi.number().allow(0, 1).required(),
  sym2_cannot_smell: Joi.number().allow(0, 1).required(),
  sym2_rash: Joi.number().allow(0, 1).required(),
  sym2_red_eye: Joi.number().allow(0, 1).required(),

  //----Should be in register----
  rf_copd_chronic_lung_disease: Joi.number().allow(0, 1).required(),

  rf_ckd_stagr_3_to_4: Joi.number().allow(0, 1).required(),
  rf_chronic_heart_disease: Joi.number().allow(0, 1).required(),
  rf_cva: Joi.number().allow(0, 1).required(),
  rf_t2dm: Joi.number().allow(0, 1).required(),
  rf_cirrhosis: Joi.number().allow(0, 1).required(),
  rf_immunocompromise: Joi.number().allow(0, 1).required(),

  fac_diabetes: Joi.number().allow(0, 1).required(),
  fac_dyslipidemia: Joi.number().allow(0, 1).required(),
  fac_hypertension: Joi.number().allow(0, 1).required(),
  fac_heart_diseases: Joi.number().allow(0, 1).required(),
  fac_esrd: Joi.number().allow(0, 1).required(),
  fac_cancer: Joi.number().allow(0, 1).required(),
  fac_tuberculosis: Joi.number().allow(0, 1).required(),
  fac_hiv: Joi.number().allow(0, 1).required(),
  fac_asthma: Joi.number().allow(0, 1).required(),
  fac_pregnancy: Joi.number().allow(0, 1).required(),
  fac_bed_ridden_status: Joi.number().allow(0, 1).required(),
  fac_uri_symptoms: Joi.number().allow(0, 1).required(),
  fac_olfactory_symptoms: Joi.number().allow(0, 1).required(),
  fac_diarrhea: Joi.number().allow(0, 1).required(),
  fac_dyspnea: Joi.number().allow(0, 1).required(),
  fac_chest_discomfort: Joi.number().allow(0, 1).required(),
  fac_gi_symptoms: Joi.number().allow(0, 1).required(),
  noAuth: Joi.boolean(),
});


export type HistoryType = Joi.extractType<typeof HistorySchema>;

