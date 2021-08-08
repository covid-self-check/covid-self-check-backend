const Joi = require("joi");

module.exports = Joi.object({
  users: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().length(13).required(),
      })
    )
    .unique((a, b) => a.id === b.id)
    .required(),
  // ids: Joi.array().items(Joi.string()).required(),
  noAuth: Joi.boolean(),
});