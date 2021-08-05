const greeting = require("../json/greeting.json");
const welcomepos1 = require("../json/welcomepos1.json");
const welcomepos2 = require("../json/welcomepos2.json");
const help = require("../json/help.json");
const symptomDiagnostic = require("../json/symptomDiagnostic.json");
const info1 = require("../json/info1.json");
const info2 = require("../json/info2.json");
const info3 = require("../json/info3.json");
const info4 = require("../json/info4.json");
const info5 = require("../json/info3.json");
const info6 = require("../json/info6.json");
const defaultReply = require("../json/defaultReply.json");
const tutorial1 = require("../json/tutorial1.json");
const tutorial2 = require("../json/tutorial2.json");

const map = { greeting, welcomepos1, welcomepos2, help, symptomDiagnostic, info1, info2, info3, info4, info5, info6, defaultReply, tutorial1, tutorial2, requestCall };

module.exports = { jsonController: (json) => map[json] };
