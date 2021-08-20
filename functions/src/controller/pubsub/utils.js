const { get36hrsUsers } = require("../exportController/utils");

exports.calculateHours = (currentDate, lastUpdatedDate) => {
  return Math.abs(currentDate - lastUpdatedDate) / 36e5;
};

exports.getnumberusersbtw36hrsto72hrs = async () => {
  const temp_notUpdatedList = await get36hrsUsers();
  return temp_notUpdatedList.length;
};
