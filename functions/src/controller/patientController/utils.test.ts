import * as _ from "lodash";
import { statusList, statusListReverse } from "../../api/const";
import { HistoryType } from "../../schema";
import { Timestamp } from "@google-cloud/firestore";
import {
  snapshotExists,
  updateSymptomAddCreatedDate,
  updateSymptomCheckUser,
  updateSymptomCheckAmed,
  updateSymptomUpdateStatus,
  setAmedStatus,
  createFollowUpObj
} from "./utils";
const { admin } = require("../../init");

const randomInt = (n = 1): number => {
  return Math.floor(Math.random() * n)
}

const randomEIHResult = () => {
  const results = ["positive", "negative", "neutral", "unknown"]
  return results[randomInt(4)]
}

const randomGender = (): "male" | "female" | "unknown" => {
  const n = randomInt(3);
  if (n === 0) {
    return "male"
  } else if (n === 2) {
    return "female"
  } else {
    return "unknown"
  }
}

const randomStatus = () => {
  const n = _.keys(statusListReverse).length
  return statusListReverse[randomInt(n)]
}

const createMockFollowUpInput = (): Omit<HistoryType, 'noAuth' | 'lineIDToken' | 'lineUserID'> => {
  return {
    age: randomInt(80),
    gender: randomGender(),
    height: randomInt(200),
    weight: randomInt(100),
    sp_o2: randomInt(100),
    sp_o2_ra: randomInt(100),
    sp_o2_after_eih: randomInt(100),
    eih_result: randomEIHResult(),
    sym1_severe_cough: randomInt(),
    sym1_chest_tightness: randomInt(),
    sym1_poor_appetite: randomInt(),
    sym1_fatigue: randomInt(),
    sym1_persistent_fever: randomInt(),
    sym2_tired_body_ache: randomInt(),
    sym2_cough: randomInt(),
    sym2_fever: randomInt(),
    sym2_liquid_stool: randomInt(),
    sym2_cannot_smell: randomInt(),
    sym2_rash: randomInt(),
    sym2_red_eye: randomInt(),
    fac_bed_ridden_status: randomInt(),
    fac_uri_symptoms: randomInt(),
    fac_olfactory_symptoms: randomInt(),
    fac_diarrhea: randomInt(),
    fac_dyspnea: randomInt(),
    fac_chest_discomfort: randomInt(),
    fac_gi_symptoms: randomInt(),
    rf_ckd_stagr_3_to_4: randomInt(),
    rf_chronic_heart_disease: randomInt(),
    rf_cva: randomInt(),
    rf_t2dm: randomInt(),
    rf_cirrhosis: randomInt(),
    rf_immunocompromise: randomInt(),
    fac_diabetes: randomInt(),
    fac_dyslipidemia: randomInt(),
    fac_hypertension: randomInt(),
    fac_heart_diseases: randomInt(),
    fac_esrd: randomInt(),
    fac_cancer: randomInt(),
    fac_tuberculosis: randomInt(),
    fac_hiv: randomInt(),
    fac_asthma: randomInt(),
    fac_pregnancy: randomInt(),
    rf_copd_chronic_lung_disease: randomInt()
  }
}

const createMockAPIResult = () => {
  return {
    inclusion_label: randomStatus(),
    inclusion_label_type: "at_least",
    triage_score: randomInt(150)
  }
}

describe("createFollowUpObj", () => {
  it("should set followUp payload correctly", () => {
    const mockFollowUpInput = createMockFollowUpInput()
    const { inclusion_label, inclusion_label_type, triage_score } = createMockAPIResult()

    const status = statusList[inclusion_label]
    const timestamp = Timestamp.now()
    const result = createFollowUpObj(
      mockFollowUpInput,
      status,
      inclusion_label_type,
      triage_score,
      timestamp
    ) as { [key: string]: any }

    for (const [key, value] of _.entries(mockFollowUpInput)) {
      expect(result[key]).toEqual(value)
    }

    expect(result["status"]).toEqual(status)
    expect(result["triage_score"]).toEqual(triage_score)
    expect(result["status_label_type"]).toEqual(inclusion_label_type)
    expect(result["lastUpdatedAt"]).toEqual(timestamp)
    expect(result["createdDate"]).toEqual(timestamp)
  })

})

describe("snapshotExists", () => {
  it("throw amed", () => {
    function checkExists() {
      const mockSnapshot = { exists: true, data: () => ({ toAmed: 1 }) };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      snapshotExists(mockSnapshot);
    }
    expect(checkExists).toThrowError(
      "your information is already handle by Amed"
    );
  });
  it("throw มีข้อมูลแล้ว", () => {
    function checkExists() {
      const mockSnapshot = { exists: true, data: () => ({ toAmed: 0 }) };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      snapshotExists(mockSnapshot);
    }
    expect(checkExists).toThrowError("มีข้อมูลผู้ใช้ในระบบแล้ว");
  });
});

describe("updateSymptomAddCreatedDate", () => {
  it("should add createdDate correctly", () => {
    const mockObj = {};
    const createdDate = new Date();

    updateSymptomAddCreatedDate(
      mockObj,
      admin.firestore.Timestamp.fromDate(createdDate)
    );
    expect(mockObj).toEqual({
      createdDate: admin.firestore.Timestamp.fromDate(createdDate),
    });
  });
});

describe("updateSymptomCheckUser", () => {
  it("throw ไม่พบผู้ใช้", () => {
    const lineUserID = "testUserId";

    function checkUser() {
      const mockSnapshot = { exists: false };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateSymptomCheckUser(mockSnapshot, lineUserID);
    }
    expect(checkUser).toThrowError(`ไม่พบผู้ใช้ ${lineUserID}`);
  });
});

describe("updateSymptomCheckAmed", () => {
  it("should throw Amed", () => {
    function amed() {
      const mockSnapshotData = { toAmed: 1 };
      updateSymptomCheckAmed(mockSnapshotData);
    }
    expect(amed).toThrowError("your information is already handle by Amed");
  });
});

describe("updateSymptomUpdateStatus", () => {
  it("should update status correctly", () => {
    const mockObj = {};
    const date = admin.firestore.Timestamp.fromDate(new Date());
    updateSymptomUpdateStatus(mockObj, 1, "normal", 2, date);
    expect(mockObj).toEqual({
      status: 1,
      status_label_type: "normal",
      triage_score: 2,
      lastUpdatedAt: date,
    });
  });
});

describe("setAmedStatus", () => {
  const statusList = {
    unknown: 0,
    G1: 1,
    G2: 2,
    Y1: 3,
    Y2: 4,
    R1: 5,
    R2: 6,
  };
  const TO_AMED_STATUS = {
    includes: (status: any) => {
      return amedList.includes(status) ? true : false;
    },
  };

  const amedList = [
    statusList["G2"],
    statusList["Y1"],
    statusList["Y2"],
    statusList["R1"],
    statusList["R2"],
  ];
  it("should set status to 1", () => {
    const mockObj = {};
    const mockStatus = 2;
    const previousStatus = 1;
    setAmedStatus(mockObj, mockStatus, previousStatus, TO_AMED_STATUS);
    expect(mockObj).toEqual({
      toAmed: 1,
    });
  });
});
