const greeting = require("../json/greeting.json");
const welcomepos1 = require("../json/welcomepos1.json");
const welcomepos2 = require("../json/welcomepos2.json");
const help = require("../json/help.json");
const symptomDiagnostic = require("../json/symptomDiagnostic.json");
const info1 = require("../json/info1.json");
const info2 = require("../json/info2.json");
const info3 = require("../json/info3.json");
const defaultReply = require("../json/defaultReply.json");

const map = { greeting, welcomepos1, welcomepos2, help, symptomDiagnostic, info1, info2, info3,defaultReply };

module.exports = { jsonController: (json) => map[json] };
