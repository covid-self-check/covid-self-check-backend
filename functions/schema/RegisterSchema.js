const Joi = require("joi");

module.exports = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  personalID: Joi.string().length(13).required(),
  age: Joi.number().integer().required(),
  weight: Joi.number().required(),
  height: Joi.number().required(),
  gender: Joi.string().valid("male", "female", "unknown").required(),

  address: Joi.string().required(),
  province: Joi.string().required(),
  prefecture: Joi.string().required(), //อำเภอ
  district: Joi.string().required(), //ตำบล
  postNo: Joi.string().length(5).required(),

  personalPhoneNo: Joi.string().required(),
  lineIDToken: Joi.string().required(),
  lineUserID: Joi.string().required(),
  emergencyPhoneNo: Joi.string().required(),

  //hasHelper: Joi.boolean().required(),
  //digitalLiteracy: Joi.boolean().required(),

  station: Joi.string().required(), //not in front-end yet na

  gotFavipiravia: Joi.boolean().required(),

  // โรคประจำตัว
  COPD: Joi.boolean().required(),
  chronicLungDisease: Joi.boolean().required(),
  CKDStage3or4: Joi.boolean().required(),
  chronicHeartDisease: Joi.boolean().required(),
  CVA: Joi.boolean().required(),
  T2DM: Joi.boolean().required(),
  cirrhosis: Joi.boolean().required(),
  immunocompromise: Joi.boolean().required(),

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

  // optional
  congenitalDisease: Joi.string().allow("", null),
  dose1Name: Joi.string().allow("", null),
  dose1Date: Joi.date().allow("", null),
  dose2Name: Joi.string().allow("", null),
  dose2Date: Joi.date().greater(Joi.ref("dose1Date")).allow("", null),
  favipiraviaAmount: Joi.number().allow("", null),

  // โรคประจำตัว
});
