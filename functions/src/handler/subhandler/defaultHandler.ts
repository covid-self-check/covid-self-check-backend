export const handleDefault = async (event: any, userObject: any, client: any) => {
  const replyToken = event.replyToken;
  await client.replyMessage(replyToken, {
    type: "text",
    text: "ขอโทษด้วยเรายังไม่สามารถโต้ตอบได้",
  });
};

