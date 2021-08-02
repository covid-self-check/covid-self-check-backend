const Joi = require("joi");

module.exports = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  personalID: Joi.string().length(13).required(),
  lineId: Joi.string().required(),
  age: Joi.number().integer().required(),
  gender: Joi.string().valid("ชาย", "หญิง", "ไม่ระบุ").required(),
  weight: Joi.number().required(),
  height: Joi.number().required(),
  address: Joi.string().required(),
  hasHelper: Joi.boolean().required(),
  digitalLiteracy: Joi.boolean().required(),
  personalPhoneNo: Joi.string().required(),
  emergencyPhoneNo: Joi.string().required(),
  //additional field added according to the pic
  station: Joi.string().required(),
  
  gotFavipiravia: Joi.boolean().required(),
  
  

  // optional
  congenitalDisease: Joi.string(),
  dose1Name: Joi.string(),
  dose1Date: Joi.date().allow("",null),
  dose2Name: Joi.string(),
  dose2Date: Joi.date().greater(Joi.ref("dose1Date")).allow("",null),
  favipiraviaAmount: Joi.number(),
});
