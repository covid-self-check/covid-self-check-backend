import { Message } from "@line/bot-sdk";

const greetingMessage: Message = {
  type: "text",
  text: "สวัสดีค่ะ เราคือ “เพื่อนช่วยเช็ค” เพื่อนที่จะมาช่วยให้คุณสามารถประเมินอาการตนเองเบื้องต้น เเละให้ข้อมูลที่ควรทราบเกี่ยวกับโควิด-19 ค่ะ 😘\n\n🌈คุณสามารถกด “เมนู” เพื่อเริ่มใช้งานเราค่ะ 🥰\n\n👉 กด “ประเมินอาการ” เพื่อประเมินอาการของตนเองเเละรับคำเเนะนำเบื้องต้นตามระดับอาการของคุณ\n👉 กด “เบอร์ติดต่อฉุกเฉิน” หากคุณต้องการเบอร์ติดต่อบุคลากรทางการเเพทย์หรือหาเตียง\n👉 กด “คำแนะนำตามอาการที่พบ” เพื่อศึกษาวิธีการดูเเลตนเองเบื้องต้นสำหรับอาการต่างๆจากโควิด-19\n👉 กด “ข้อควรรู้สำหรับผู้ป่วย” ดูข้อมูลการกินยาเเละสิ่งอื่นๆที่คุณควรทราบ สำหรับผู้ป่วยโควิด-19\n\n🚑 “เพื่อนช่วยเช็ค” ไม่มีบริการทางการเเพทย์ รบกวนผู้ป่วยติดต่อเบอร์ฉุกเฉิน คลินิก หรือโรงพยาบาลที่ดูเเลคุณหากมีเหตุจำเป็น หากคุณมีความเสี่ยงที่จะติดเชื้อ โปรดเข้ารับการตรวจหาเชื้อเพื่อเข้าระบบการรักษาต่อไป\n\n🌈 อย่าลืมมาประเมินอาการตนเองทุกวันนะคะ 😘\n🤝 พวกเราขอเป็นกำลังใจให้ทุกคนผ่านวิกฤตินี้ไปด้วยกัน 💫",
};

const greetingPhoto: Message = {
  type: "image",
  originalContentUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/S__56058669_new.jpg?alt=media&token=0ef23d73-0943-4a86-9dbf-9c0f451e8a44",
  previewImageUrl:
    "https://firebasestorage.googleapis.com/v0/b/comcovid-prod.appspot.com/o/S__56058669_new.jpg?alt=media&token=0ef23d73-0943-4a86-9dbf-9c0f451e8a44",
};


const defaultReplyMessage: Message = {
  type: "text",
  text: "ขออภัยค่ะ ไลน์ของเราเป็นระบบอัตโนมัติ ไม่สามารถตอบคุณกลับได้😢 🙏🏻\n\nคุณสามารถกด “☰” ด้านซ้ายของกล่องข้อความ เเละกด “เมนู” เพื่อเลือกใช้งานส่วนอื่นๆต่อไป",
};

export { greetingMessage, defaultReplyMessage, greetingPhoto };