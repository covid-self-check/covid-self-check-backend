const { jsonController } = require("../jsonHandler");

export const handleFollow = async (event: any, userObject: any, client: any) => {
  const replyToken = await event.replyToken;
  try {
    // let greeting = jsonController("greeting");
    await client.replyMessage(replyToken, [
      jsonController("welcomepos1"),
      jsonController("welcomepos2"),
      jsonController("greeting"),
    ]);
  } catch (error) {
    console.log(error);
    await client.replyMessage(replyToken, {
      type: "text",
      text: "ERROR, please report admin !",
    });
  }
};


