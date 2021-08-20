const {get36hrsUsers} = require("../exportController/utils");

exports.getnumberusersbtw36hrsto72hrs = async() => {
    const temp_notUpdatedList = await get36hrsUsers();
    return temp_notUpdatedList.length;
  }