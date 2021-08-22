import * as Joi from 'joi';

export const ImportPatientIdSchema = Joi.object({
  users: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        status: Joi.number().valid(0, 1, 99).required(),
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

export type ImportPatientIdType = Joi.extractType<typeof ImportPatientIdSchema>;

