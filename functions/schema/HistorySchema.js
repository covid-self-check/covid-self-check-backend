const Joi = require("joi");

module.exports = Joi.object({
  lineIDToken: Joi.string().required(),
  lineUserID: Joi.string().required(),
  bodyTemperature: Joi.number().required(),
  pulse: Joi.number().required(),
  spO2: Joi.number().required(),
  cough: Joi.boolean().required(),
  soreThroat: Joi.boolean().required(),
  headAche: Joi.boolean().required(),
  hasHelper: Joi.boolean().required(),
});
