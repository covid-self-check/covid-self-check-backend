//mon added code
const Joi = require("joi");

module.exports = Joi.object({
  personalID: Joi.string().required(),
  noAuth: Joi.boolean(),
});
//end mon code
