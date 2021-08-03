const greeting = require("../json/greeting.json");

const map = { greeting };
module.exports = { jsonController: (json) => map[json] };
