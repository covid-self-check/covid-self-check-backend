import * as Joi from '@hapi/joi';
import 'joi-extract-type';

export const DeletePatientSchema = Joi.object({
  personalID: Joi.string().required(),
  noAuth: Joi.boolean(),
});

export type DeletePatientType = Joi.extractType<typeof DeletePatientSchema>;

