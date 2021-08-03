const Joi = require("joi");

module.exports = Joi.object({
  lineIDToken: Joi.string().required(),
  lineUserID: Joi.string().required(),
  bodyTemperature: Joi.number().required(),
  pulse: Joi.number().required(),
  spO2: Joi.number().required(),
  // ไอชัดเจน
  cough: Joi.boolean().required(),
  // ไข้
  cold: Joi.boolean().required(),
  // ถ่ายเหลว
  liquidStool: Joi.boolean().required(),
  // จมูกไม่ได้กลิ่น
  canNotSmell: Joi.boolean().required(),
  // ผื่น
  rash: Joi.boolean().required(),
  // ตาแดง
  redEye: Joi.boolean().required(),
  // ไอเยอะ
  severeCough: Joi.boolean().required(),
  // แน่นหน้าอก
  chestTightness: Joi.boolean().required(),
  // ทานอาหารไม่ได้
  poorAppetite: Joi.boolean().required(),
  // อ่อนเพลียมาก
  fatigue: Joi.boolean().required(),
  // มีไข้ตลอดทุกวันในช่วงที่มีอาการ ตลอด 5-6 วันที่ สังเกตอาการ
  persistentFever: Joi.boolean().required(),
});
