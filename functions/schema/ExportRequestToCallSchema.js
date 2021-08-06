const Joi = require("joi");

module.exports = Joi.object({
  volunteerSize: Joi.number().required(),
  noAuth: Joi.boolean(),
});
