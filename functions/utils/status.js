const status = {
  noSymptom: 0,
  green: 1,
  yellow: 2,
  red: 3,
};

exports.isYellow = (snapshot) => {
  const lastFollowUp = snapshot.followUp[snapshot.lastFollowUp.length - 1];
  // อายุตั้งแต่ 60 ปี หรือ เด็กตั้งแต่ 5 ปีลงมา
  const isOld = snapshot.age <= 5 || snapshot.age >= 60;

  // มีอาการมากไข้สูง ( เกิน 38 องศา )
  const isCold = lastFollowUp
    ? lastFollowUp.bodyTemperature >= 38
    : snapshot.snapshot === status.yellow;

  // ไอมาก ไอแล้วเหนื่อย ท้องเสีย 3 ครั้ง/ วัน หรือ มากกว่า
  const isCough = lastFollowUp
    ? lastFollowUp.isCough
    : snapshot.status === status.yellow;

  // มีอาการหอบเหนื่อยหายใจเร็ว แน่นหน้าอก เวียนหัว อ่อนเพลีย
  const isExhausted = lastFollowUp
    ? lastFollowUp.isExhausted
    : snapshot.status === status.yellow;

  const hasDisease =
    // โรคปอดและโรคทางเดินหายใจ เช่น หอบหืด โรคหลอดลมอุดกั้นเรื้อรัง ปอดอักเสบ วัณโรคปอด ถุงลมโป่งพอง
    snapshot.lungDisease ||
    // โรคไตเรื้อรัง
    snapshot.kidneyDisease ||
    // โรคหัวใจและหลอดเลือก
    snapshot.heartDisease ||
    // โรคเบาหวาน
    snapshot.diabetes ||
    // โรคหลอดเลือดสมอง อัมพาต อัมพฤกษ์ เส้นเลือดสมองอุดตัน, ตีบ, แตก ความดันโลหิตสูง ไขมันสูง
    snapshot.paralysis ||
    // โรคอ้วน (น้ำหนักเกิน 90 kg)
    snapshot.weight >= 90 ||
    // ภูมิคุ้มกันบกพร่อง ภูมิคุ้มกันตำ่ เช่น โรคตับ โรค LSD โรคมะเร็ง
    snapshot.immuneDeficiency;

  return isOld || isCold || isCough || isExhausted || hasDisease;
};
