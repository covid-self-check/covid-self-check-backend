const Joi = require("joi");

exports.registerSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  personalID: Joi.string().length(13).required(),
  age: Joi.number().integer().required(),
  gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
  height: Joi.number().required(),
  address: Joi.string().required(),
  hasHelper: Joi.boolean().required(),
  digitalLiteracy: Joi.boolean().required(),
  personalPhoneNo: Joi.string().required(),
  personalLineID: Joi.string().required(),
  closestUnriskPersonPhoneNo: Joi.string().required(),

  // optional
  congenitalDisease: Joi.string(),
  dose1Status: Joi.string(),
  dose1Date: Joi.date(),
  dose2Status: Joi.string(),
  dose2Date: Joi.date().greater(Joi.ref("dose1Date")),
});
