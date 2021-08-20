exports.calculateDropOff = async (patient, followUp) => {
  const currentDate = new Date();

  let hours;
  const lastUpdateDate = patient.lastUpdatedAt.toDate();
  if (followUp.length <= 1) {
    hours = calculateHours(currentDate, lastUpdateDate);
  } else {
    const firstActiveDate = followUp[0].createdDate.toDate();
    hours = calculateHours(lastUpdateDate, firstActiveDate);
  }

  return hours;
};

const calculateHours = (currentDate, lastUpdatedDate) => {
  return Math.abs(currentDate - lastUpdatedDate) / 36e5;
};
