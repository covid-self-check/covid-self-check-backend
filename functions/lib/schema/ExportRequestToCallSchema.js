"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
module.exports = Joi.object({
  volunteerSize: Joi.number().required(),
  noAuth: Joi.boolean(),
});
//# sourceMappingURL=ExportRequestToCallSchema.js.map
