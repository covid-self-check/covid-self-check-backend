"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
module.exports = Joi.object({
  lineIDToken: Joi.string().required(),
  lineUserID: Joi.string().required(),
  noAuth: Joi.boolean(),
  name: Joi.string().required(),
  personalPhoneNo: Joi.string().required(),
});
//# sourceMappingURL=RequestToRegisterSchema.js.map
