const Joi = require("joi");

module.exports = Joi.object({
  lineId: Joi.string().required(), // TODO: get from authentication
  bodyTemperature: Joi.number().required(),
  pulse: Joi.number().required(),
  spO2: Joi.number().required(),
  cough: Joi.boolean().required(),
  soreThroat: Joi.boolean().required(),
  headAche: Joi.boolean().required(),
  hasHelper: Joi.boolean().required(),
});
