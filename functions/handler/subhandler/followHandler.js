const { jsonController } = require("../jsonHandler");

const handleFollow = async (event, userObject, client) => {
  const replyToken = await event.replyToken;
  try {
    let greeting = jsonController("greeting");
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

module.exports = {
  handleFollow,
};
