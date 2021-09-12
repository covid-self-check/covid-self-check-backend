import { emergencyNumberMessage } from "./emergency";
import {
  faqCarousel,
  faqMessage,
  insurance1Message,
  insurance2Message,
} from "./faq";
import { greetingMessage, greetingPhoto, defaultReplyMessage } from "./others";
import {
  symptomCarousel,
  coughMessage,
  feverMessage,
  stomachMessage,
  breatheMessage,
  symptomListMessage
} from "./symptoms";

const messageMap = {
  emergencyNumberMessage: emergencyNumberMessage,
  faqCarousel: faqCarousel,
  faqMessage: faqMessage,
  insurance1Message: insurance1Message,
  insurance2Message: insurance2Message,
  greetingMessage: greetingMessage,
  greetingPhoto: greetingPhoto,
  defaultReplyMessage: defaultReplyMessage,
  symptomCarousel: symptomCarousel,
  coughMessage: coughMessage,
  feverMessage: feverMessage,
  stomachMessage: stomachMessage,
  breatheMessage: breatheMessage,
  symptomListMessage: symptomListMessage
};

export default messageMap;
