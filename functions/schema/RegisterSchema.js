const Joi = require("joi");

module.exports = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  personalID: Joi.string().length(13).required(),
  age: Joi.number().integer().required(),
  weight: Joi.number().required(),
  height: Joi.number().required(),
  gender: Joi.string().valid("ชาย", "หญิง", "ไม่ระบุ").required(),

  address: Joi.string().required(),
  province: Joi.string().required(),
  prefecture:Joi.string().required(),//อำเภอ
  district:Joi.string().required(),//ตำบล
  postNo:Joi.number().length(5).required(),

  personalPhoneNo: Joi.string().required(),
  lineId: Joi.string().required(),
  emergencyPhoneNo: Joi.string().required(),

  hasHelper: Joi.boolean().required(),
  digitalLiteracy: Joi.boolean().required(),
  
  
  station: Joi.string().required(),//not in front-end yet na
  
  gotFavipiravia: Joi.boolean().required(),
  
  

  // optional
  congenitalDisease: Joi.string(),
  dose1Name: Joi.string(),
  dose1Date: Joi.date().allow("",null),
  dose2Name: Joi.string(),
  dose2Date: Joi.date().greater(Joi.ref("dose1Date")).allow("",null),
  favipiraviaAmount: Joi.number(),
});
