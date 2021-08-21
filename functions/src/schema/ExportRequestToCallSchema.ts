import * as Joi from 'joi';

export const ExportRequestToCallSchema = Joi.object({
  volunteerSize: Joi.number().required(),
  noAuth: Joi.boolean(),
});

export type ExportRequestToCallType = Joi.extractType<typeof ExportRequestToCallSchema>;
