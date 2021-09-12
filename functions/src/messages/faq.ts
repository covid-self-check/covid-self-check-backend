import { Message } from "@line/bot-sdk";

const faqCarousel: Message = {
  type: "template",
  altText: "ข้อควรรู้สำหรับผู้ป่วย",
  template: {
    type: "image_carousel",
    columns: [
      {
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fcover_faq.jpg?alt=media&token=b5537548-c65c-4494-8ee0-ddc8288b2cc9",
        action: {
          type: "message",
          text: "รายละเอียดข้อควรรู้",
        },
      },
      {
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fcover_insurance.jpg?alt=media&token=8ead3f10-6198-4518-9cd3-16d5ccb23855",
        action: {
          type: "message",
          text: "สิทธิการเบิกประกัน",
        },
      },
    ],
  },
};

const faqMessage: Message = {
  type: "image",
  originalContentUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fdetail_faq.jpg?alt=media&token=946feb08-1a46-467c-b53e-d033d65d61b9",
  previewImageUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fdetail_faq.jpg?alt=media&token=946feb08-1a46-467c-b53e-d033d65d61b9",
};

const insurance1Message: Message = {
  type: "image",
  originalContentUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fdetail_insurance_1.jpg?alt=media&token=5d9ed79d-099e-4767-87fa-e5d4b36b7bf5",
  previewImageUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fdetail_insurance_1.jpg?alt=media&token=5d9ed79d-099e-4767-87fa-e5d4b36b7bf5",
};

const insurance2Message: Message = {
  type: "image",
  originalContentUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fdetail_insurance_2.jpg?alt=media&token=e0a53dce-ae46-40bc-a50f-c515c3184e6b",
  previewImageUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/FAQ%2Fdetail_insurance_2.jpg?alt=media&token=e0a53dce-ae46-40bc-a50f-c515c3184e6b",
};

export {faqCarousel, faqMessage, insurance1Message, insurance2Message};