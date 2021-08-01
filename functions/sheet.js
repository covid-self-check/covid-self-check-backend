const functions = require("firebase-functions");
const { google } = require("googleapis");
const { serviceAccount } = require("./config");

const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

exports.jwtAuthPromise = jwtClient.authorize();

/**
 *
 * @param {string} id
 * @param {string} username
 * @param {string} date
 * @param {[any]} bids
 */
exports.exportBids = async (id, username, date, bids) => {
  console.info(`Exporting bids ${id}`);

  const finalData = [];
  bids.forEach(function (bid) {
    finalData.push([id, date, username, bid.bidder, bid.offer]);
  });

  await jwtAuthPromise;
  await sheets.spreadsheets.values.append(
    {
      auth: jwtClient,
      spreadsheetId: "1YpO8oe2I8cEImtKjnBscOLbiNnnTaDP1e82YAaymu20",
      range: `Sheet1!A1:E1`,
      valueInputOption: "RAW",
      requestBody: { values: finalData, majorDimension: "ROWS" },
    },
    {}
  );
};
