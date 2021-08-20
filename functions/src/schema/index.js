module.exports = {
  historySchema: require("./HistorySchema"),
  registerSchema: require("./RegisterSchema"),
  getProfileSchema: require("./GetProfileSchema"),
  requestToRegisterSchema: require("./RequestToRegisterSchema"),
  importPatientIdSchema: require("./ImportPatientIdSchema"),
  importRequestToRegisterSchema: require("./ImportRequestToRegisterSchema"),
  importWhitelistSchema: require("./ImportWhitelistSchema"),
  exportRequestToCallSchema: require("./ExportRequestToCallSchema"),
  //mon added this
  deletePatientSchema: require("./DeletePatientSchema"),
  //end mon code
};
