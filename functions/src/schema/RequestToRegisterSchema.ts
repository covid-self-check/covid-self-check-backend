import * as Joi from '@hapi/joi';
import 'joi-extract-type';

export const RequestToRegisterSchema = Joi.object({
  lineIDToken: Joi.string().required(), // TODO: get from authentication
  lineUserID: Joi.string().required(),
  noAuth: Joi.boolean(),
  name: Joi.string().required(),
  personalPhoneNo: Joi.string().required(),
});

export type RequestToRegisterType = Joi.extractType<typeof RequestToRegisterSchema>;