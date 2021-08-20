import * as Joi from 'joi';

export const ImportRequestToRegisterSchema = Joi.object({
  users: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        status: Joi.string().valid(0, 1).required(),
      })
    )
    .unique((a, b) => a.id === b.id)
    .required(),
  // ids: Joi.array().items(Joi.string()).required(),
  noAuth: Joi.boolean(),
});

export type ImportRequestToRegisterType = Joi.extractType<typeof ImportRequestToRegisterSchema>;

