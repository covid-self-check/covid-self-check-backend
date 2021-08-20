import * as Joi from '@hapi/joi';
import 'joi-extract-type';

export const ImportWhitelistSchema = Joi.object({
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


export type ImportWhitelistType = Joi.extractType<typeof ImportWhitelistSchema>;

