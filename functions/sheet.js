const { google } = require("googleapis");
const { serviceAccount, spreadsheetId } = require("./config");
const sheets = google.sheets("v4");

const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const jwtAuthPromise = jwtClient.authorize();

/**
 *
 * @param {any} data
 * @param {[any]} bids
 */
exports.exportPatient = async (id, data) => {
  console.info(`Exporting  ${id}`);
  const finalData = [
    [id, data.firstName, data.lastName, data.age, data.weight],
  ];
  await jwtAuthPromise;
  await sheets.spreadsheets.values.append(
    {
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: `Sheet1!A1:E1`,
      valueInputOption: "RAW",
      requestBody: { values: finalData, majorDimension: "ROWS" },
    },
    {}
  );
};
