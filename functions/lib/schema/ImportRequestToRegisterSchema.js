"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
module.exports = Joi.object({
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
//# sourceMappingURL=ImportRequestToRegisterSchema.js.map
