import { statusList } from "../api/const";

export const TO_AMED_STATUS = [
  statusList["Y1"],
  statusList["Y2"],
  statusList["R1"],
  statusList["R2"],
];

export const status = ["noSuggestion", "G1", "G2", "Y1", "Y2", "R1", "R2"];
export const sheetName = [
  "รายงานผู้ป่วยเหลืองไม่มีอาการ",
  "รายงานผู้ป่วยเหลืองมีอาการ",
  "รายงานผู้ป่วยแดงอ่อน",
  "รายงานผู้ป่วยแดงเข้ม",
];

export const MAP_PATIENT_FIELD: { [key: string]: string } = {
  รหัสบัตรประจำตัวประชาชน: "personalID",
  ชื่อ: "firstName",
  นามสกุล: "lastName",
  "วัน/เดือน/ปีเกิด": "birthDate",
  น้ำหนัก: "weight",
  ส่วนสูง: "height",
  เพศ: "gender",
  ที่อยู่: "address",
  ตำบล: "district",
  อำเภอ: "prefecture",
  จังหวัด: "province",
  รหัสไปรษณีย์: "postNo",
  เบอร์ติดต่อ: "personalPhoneNo",
  เบอร์ติดต่อฉุกเฉิน: "emergencyPhoneNo",
  ได้รับยาแล้ว: "gotFavipiravir",

  ค่าออกซิเจนปลายนิ้ว: "sp_o2",
  "ค่าออกซิเจนปลายนิ้ว ขณะหายใจปกติ": "sp_o2_ra",
  "ค่าออกซิเจนปลายนิ้ว หลังลุกนั่ง 1 นาที": "sp_o2_after_eih",
  ผลตรวจออกซิเจนหลังลุกนั่ง: "eih_result",

  มีอาการไอต่อเนื่อง: "sym1_severe_cough",
  "มีอาการแน่นหน้าอก หายใจไม่สะดวก": "sym1_chest_tightness",
  เบื่ออาหาร: "sym1_poor_appetite",
  อ่อนเพลียมาก: "sym1_fatigue",
  มีไข้สูงลอย: "sym1_persistent_fever",

  // โรคประจำตัว
  มีโรคปอดเรื้อรัง: "rf_copd_chronic_lung_disease",

  "มีโรคไตเรื้อรัง ตั้งแต่ระดับสามขึ้นไป": "rf_ckd_stagr_3_to_4",
  มีโรคหัวใจ: "rf_chronic_heart_disease",
  มีโรคหลอดเลือดสมอง: "rf_cva",
  t2dm: "rf_t2dm",
  มีโรคตับแข็ง: "rf_cirrhosis",
  มีภาวะภูมิคุ้มกันบกพร่อง: "rf_immunocompromise",

  // อาการกลุ่มที่ 2
  "มีอาการอ่อนเพลีย ปวดเมื้อยตามตัว": "sym2_tired_body_ache",
  มีอาการไอรุนแรง: "sym2_cough",
  มีไข้ขึ้น: "sym2_fever",
  ท้องเสีย: "sym2_liquid_stool",
  จมูกไม่รับกลิ่น: "sym2_cannot_smell",
  มีผื่นขึ้นตามตัว: "sym2_rash",
  ตาแดง: "sym2_red_eye",

  มีโรคเบาหวาน: "fac_diabetes",
  มีโรคไขมันในเลือดสูง: "fac_dyslipidemia",
  มีโรคความดันสูง: "fac_hypertension",
  มีโรคไตเสื่อม: "fac_esrd",
  มีโรคมะเร็ง: "fac_cancer",
  เป็นวัณโรค: "fac_tuberculosis",
  "ติดเชื้อ HIV": "fac_hiv",
  มีโรคหอบหืด: "fac_asthma",
  ตั้งครรภ์: "fac_pregnancy",

  ติดเตียง: "fac_bed_ridden_status",
  มีอาการทางเดินหายใจส่วนบน: "fac_uri_symptoms",
  ท้องเสียถ่ายเหลว: "fac_diarrhea",
  "หอบเหนื่อย หายใจเร็ว/ลำบาก": "fac_dyspnea",
  มีอาการทางเดินอาหาร: "fac_gi_symptoms",
};

export const patientReportHeader = [
  "รหัสบัตรประจำตัวประชาชน",
  "ชื่อ",
  "นามสกุล",
  "เบอร์ติดต่อ",
  "เบอร์ติดต่อฉุกเฉิน",
  "อายุ",
  "น้ำหนัก",
  "ส่วนสูง",
  "เพศ",
  "วันที่ติดตามอาการล่าสุด",
  "ที่อยู่",
  "ตำบล",
  "อำเภอ",
  "จังหวัด",
  "สถานะ",
];
