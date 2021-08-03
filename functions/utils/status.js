const status = {
  noSuggestion: 0,
  G1: 1,
  G2: 2,
  Y1: 3,
  Y2:4,
  R1:5,
  R2:6
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

exports.isY1 = (snapshot)=>{
  const lastFollowUp = snapshot.followUp[snapshot.lastFollowUp.length - 1];
  const isOld = snapshot.age >60;
  const bmi = (snapshot.weight/(snapshot.height*snapshot.height))*10000;
  const hasCongenitalDisease = snapshot.COPD ||
  snapshot.chronicLungDisease ||
  snapshot.CKDStage3or4 ||
  snapshot.chronicHeartDisease ||
  snapshot.CVA ||
  snapshot.T2DM||
  snapshot.cirrhosis||
  snapshot.immunocompronise;
  const bmiExceed = bmi>30;
  const isObese = snapshot.weight >90;

  const isIll = lastFollowUp.tired ||
  lastFollowUp.cough||
  lastFollowUp.diarrhea||
  lastFollowUp.canNotSmell||
  lastFollowUp.rash||
  lastFollowUp.redEye;

  return isOld || hasCongenitalDisease || bmiExceed|| isObese || isIll;
  
}

exports.isG1 = (snapshot)=>{

}