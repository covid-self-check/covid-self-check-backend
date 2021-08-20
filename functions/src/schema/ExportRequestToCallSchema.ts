import * as Joi from '@hapi/joi';
import 'joi-extract-type';

export const ExportRequestToCallSchema = Joi.object({
  volunteerSize: Joi.number().required(),
  noAuth: Joi.boolean(),
});

export type ExportRequestToCallType = Joi.extractType<typeof ExportRequestToCallSchema>;
