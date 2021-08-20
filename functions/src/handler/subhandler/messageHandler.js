const { jsonController } = require("../jsonHandler");
const { requestCall } = require("../../linefunctions/requestCallHandler");
const { requestGuide } = require("../../linefunctions/requestGuideHandler");

const handleMessage = async (event, userObject, client) => {
  const replyToken = await event.replyToken;
  const message = await event.message.text;
  // console.log(message)
  try {
    switch (message) {
      case "ประเมินอาการ":
        await client.replyMessage(
          replyToken,
          jsonController("symptomDiagnostic")
        );
        break;
      case "สิ่งที่ควรรู้":
        await client.replyMessage(replyToken, [
          jsonController("info1"),
          jsonController("info2"),
          jsonController("info3"),
          jsonController("info4"),
          jsonController("info6"),
        ]);
        break;
      case "ติดต่อฉุกเฉิน":
        await client.replyMessage(replyToken, jsonController("help"));
        break;
      case "สอนการใช้งาน":
        await requestGuide(userObject, client, replyToken);
        break;
      case "ติดต่ออาสาสมัคร":
        await requestCall(userObject, client, replyToken);
        break;
      case "ลงทะเบียน":
        await client.replyMessage(
          replyToken,
          jsonController("closeRegistration")
        );
        break;
      default:
        await client.replyMessage(replyToken, jsonController("defaultReply"));
        break;
    }
  } catch (error) {
    console.log(error);
    await client.replyMessage(replyToken, {
      type: "text",
      text: "ERROR, please report admin !",
    });
  }
};

module.exports = {
  handleMessage,
};
