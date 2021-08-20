exports.calculateHours = (currentDate, lastUpdatedDate) => {
  return Math.abs(currentDate - lastUpdatedDate) / 36e5;
};
