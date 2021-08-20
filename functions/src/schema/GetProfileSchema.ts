import * as Joi from '@hapi/joi';
import 'joi-extract-type';

export const GetProfileSchema = Joi.object({
  lineIDToken: Joi.string().required(), // TODO: get from authentication
  lineUserID: Joi.string().required(),
  noAuth: Joi.boolean(),
});



export type GetProfileType = Joi.extractType<typeof GetProfileSchema>;
