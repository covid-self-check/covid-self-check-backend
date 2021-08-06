const Joi = require("joi");

module.exports = Joi.object({
  ids: Joi.array().items(Joi.string()).required(),
  noAuth: Joi.boolean(),
});
