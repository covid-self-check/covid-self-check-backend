import * as Joi from '@hapi/joi';
import 'joi-extract-type';

export const RegisterSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),

  birthDate: Joi.date().max("now").required(),
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

  hasHelper: Joi.boolean().default(false),
  digitalLiteracy: Joi.boolean().default(false),

  //not in front-end yet na
  // station: Joi.string().required(),

  gotFavipiravir: Joi.number().allow(0, 1).required(),

  // โรคประจำตัว
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

  // optional
  personalID: Joi.string().length(13).allow(null),
  passport: Joi.string()
    .min(7)
    .max(9)
    .allow(null)
    .when("personalID", {
      is: null,
      then: Joi.string().min(7).max(9).required(),
    }),

  dose1Name: Joi.string().allow("", null),
  dose1Date: Joi.date().max("now").allow("", null),
  dose2Name: Joi.string().allow("", null),
  dose2Date: Joi.date()
    .greater(Joi.ref("dose1Date"))
    .max("now")
    .allow("", null),
  favipiraviaAmount: Joi.number().allow("", null),
  noAuth: Joi.boolean(),
});


export type RegisterType = Joi.extractType<typeof RegisterSchema>;