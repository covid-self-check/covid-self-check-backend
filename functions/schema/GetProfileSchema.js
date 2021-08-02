const Joi = require("joi");

module.exports = Joi.object({
  lineIDToken: Joi.string().required(), // TODO: get from authentication
  userID: Joi.number().required(),
});
