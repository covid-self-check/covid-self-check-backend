const Joi = require("joi");


module.exports = Joi.object({
   lineId : Joi.string().required(),    // TODO: get from authentication
   bodyTemperature : Joi.number().required(),
   pulse: Joi.number().required(),
   spO2 : Joi.number().required(),

   cough  : Joi.boolean().required(),
   runnyNose: Joi.boolean().required(),
   redEye: Joi.boolean().required(),
   rash : Joi.boolean().required(),
   soreThroat : Joi.boolean().required(),
   canNotSmell: Joi.boolean().required(),
   canNotTaste: Joi.boolean().required(),
   canBreathRegularly: Joi.boolean().required(),//หายใจปกติไม่เหนื่อยหอบ

   diarrhoeaMoreThan3: Joi.boolean().required(),
   tired: Joi.boolean().required(),
   stuffyChest: Joi.boolean().required(),
   nausea: Joi.boolean().required(),
   
   chestHurt: Joi.boolean().required(),
   slowResponse: Joi.boolean().required(),


   headAche: Joi.boolean().required(),
   hasHelper : Joi.boolean().required(),
})