import * as Joi from 'joi';

export const DeletePatientSchema = Joi.object({
  personalID: Joi.string().required(),
  noAuth: Joi.boolean(),
});

export type DeletePatientType = Joi.extractType<typeof DeletePatientSchema>;

