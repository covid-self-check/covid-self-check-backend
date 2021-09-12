import * as greeting from "../json/others/greeting.json";
import * as welcomepos1 from "../json/welcomepos1.json";
import * as help from "../json/emergency/help.json";
import * as symptomDiagnostic from "../json/symptomDiagnostic.json";
import * as info1 from "../json/info1.json";
import * as info2 from "../json/info2.json";
import * as info3 from "../json/info3.json";
import * as info4 from "../json/info4.json";
import * as info5 from "../json/info5.json";
import * as info6 from "../json/info6.json";
import * as defaultReply from "../json/others/defaultReply.json";
import * as tutorial1 from "../json/tutorial1.json";

import * as faqCarousel from "../json/faq/faqCarousel.json";

import * as symptomCarousel from "../json/symptom/symptomCarousel.json"; 

import * as guide from "../json/guide.json";
import * as r2cQuestion from "../json/r2cQuestion.json";
import * as closeRegistration from "../json/closeRegistration.json";

import config from "../config";
const tutorial2 = {
  type: "template",
  altText: "กรอกเบอร์โทรศัพท์",
  template: {
    type: "buttons",
    text: "ระบบเรายังไม่มีข้อมูลเบอร์ของท่าน กรุณากรอกเบอร์โทรศัพท์ของท่าน",
    actions: [
      {
        type: "uri",
        label: "กรอกเบอร์โทรศัพท์",
        uri: config.line.r2rUri,
      },
    ],
  },
};

const map: { [key: string]: any } = {
  greeting,
  welcomepos1,
  help,
  faqCarousel,
  symptomCarousel,
  symptomDiagnostic,
  info1,
  info2,
  info3,
  info4,
  info5,
  info6,
  defaultReply,
  tutorial1,
  tutorial2,
  guide,
  r2cQuestion,
  closeRegistration,
};

export const jsonController = (json: string) => map[json]
