import * as Joi from "joi";

module.exports = Joi.object({
  users: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        status: Joi.string().valid(0, 1, 99).required(),
        reason: Joi.when("status", {
          is: 99,
          then: Joi.string(),
        }),
      })
    )
    .unique((a, b) => a.id === b.id)
    .required(),
  // ids: Joi.array().items(Joi.string()).required(),
  noAuth: Joi.boolean(),
});
