const Joi = require("joi");

module.exports = Joi.object({
  lineIDToken: Joi.string().required(),
  lineUserID: Joi.string().required(),
  bodyTemperature: Joi.number().required(),
  pulse: Joi.number().required(),
  spO2: Joi.number().required(),

  cough: Joi.boolean().required(),
  severeCough: Joi.boolean().required(),
  runnyNose: Joi.boolean().required(),
  redEye: Joi.boolean().required(),
  rash: Joi.boolean().required(),
  soreThroat: Joi.boolean().required(),
  canNotSmell: Joi.boolean().required(),
  canNotTaste: Joi.boolean().required(),
  canBreathRegularly: Joi.boolean().required(), //หายใจปกติไม่เหนื่อยหอบ
  poorAppetite: Joi.boolean().required(),

  diarrhoeaMoreThan3: Joi.boolean().required(),
  fatigue: Joi.boolean().required(),
  stuffyChest: Joi.boolean().required(),
  nausea: Joi.boolean().required(),

  chestHurt: Joi.boolean().required(),
  slowResponse: Joi.boolean().required(),

  headAche: Joi.boolean().required(),
  hasHelper: Joi.boolean().required(),
});
