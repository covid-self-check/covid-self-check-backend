const { object } = require("joi");
const Joi = require("joi");

module.exports = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),

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
  COPD: Joi.number().allow(0, 1).required(),
  chronicLungDisease: Joi.number().allow(0, 1).required(),
  CKDStage3or4: Joi.number().allow(0, 1).required(),
  chronicHeartDisease: Joi.number().allow(0, 1).required(),
  CVA: Joi.number().allow(0, 1).required(),
  T2DM: Joi.number().allow(0, 1).required(),
  cirrhosis: Joi.number().allow(0, 1).required(),
  immunocompromise: Joi.number().allow(0, 1).required(),

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
  personalID: Joi.string().length(13).default(""),
  passport: Joi.string()
    .min(7)
    .max(9)
    .when("personalID", {
      is: "",
      then: Joi.string().min(7).max(9).required(),
    }),
  congenitalDisease: Joi.string().allow("", null),
  dose1Name: Joi.string().allow("", null),
  dose1Date: Joi.date().allow("", null),
  dose2Name: Joi.string().allow("", null),
  dose2Date: Joi.date().greater(Joi.ref("dose1Date")).allow("", null),
  favipiraviaAmount: Joi.number().allow("", null),
});
