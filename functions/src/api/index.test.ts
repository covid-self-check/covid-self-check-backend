import moment from "moment";

const MOCK_DATA = {
  inclusion_label: "G1",
  inclusion_label_type: "normal",
  triage_score: 0,
};
const mockPostFn = jest.fn();
mockPostFn.mockReturnValue({ data: MOCK_DATA });

jest.doMock("axios", () => ({
  post: mockPostFn,
}));

const AUTHORIZATION = "token";
jest.doMock("firebase-functions", () => ({
  config: () => ({
    api: {
      authorization: AUTHORIZATION,
    },
  }),
}));

const MOCK_AGE = 40;
const MOCK_DATE = new Date("2000-01-01");
const MOCK_MOMENT = moment(MOCK_DATE);
const calculateAgeMockFn = jest.fn().mockReturnValue(MOCK_AGE);
const formatDateTimeAPIMockFn = jest.fn().mockReturnValue(MOCK_MOMENT);

jest.doMock("../utils/date", () => ({
  calculateAge: calculateAgeMockFn,
  formatDateTimeAPI: formatDateTimeAPIMockFn,
}));

describe("makeStatusAPIPayload", () => {
  const { makeStatusAPIPayload } = require(".");

  it("should make correct payload", () => {
    const data = {
      noAuth: true,
      firstName: "A3",
      lastName: "B",
      personalID: null,
      passport: "1234567",
      birthDate: { toDate: () => MOCK_DATE },
      gender: "male",
      height: 180,
      weight: 20,
      address: "บ้าน",
      province: "a",
      lineIDToken:
        "eyJraWQiOiJhMmE0NTlhZWM1YjY1ZmE0ZThhZGQ1Yzc2OTdjNzliZTQ0NWFlMzEyYmJjZDZlZWY4ZmUwOWI1YmI4MjZjZjNkIiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2FjY2Vzcy5saW5lLm1lIiwic3ViIjoiVWJhYTQxMmY3YjUxY2VjZDY0ZWIzYjlkMWMxZWVlZjE2IiwiYXVkIjoiMTY1NjI3MzMxNSIsImV4cCI6MTYyODAwNDI1OCwiaWF0IjoxNjI4MDAwNjU4LCJhbXIiOlsibGluZXNzbyJdLCJuYW1lIjoiR1VZIiwicGljdHVyZSI6Imh0dHBzOi8vcHJvZmlsZS5saW5lLXNjZG4ubmV0LzBodXcwQU95VXpLbGdOT0R5WXdpNVZEekY5SkRWNkZpd1FkUWxnUG44OGR6d2lEVzBIT0ZnM2FpMXJKRDhuQ214Y013NHhQeWctY0dCMyJ9.LhpWlUENkBukyBvuezeOjfXQeV9sinjMHdbsV3-u8yKzBsbtU9FdmGhnZDQ6MUsyQm_gVIrT6Fvz5tGtAAkkLg",
      lineUserID: "test14",
      prefecture: "a",
      district: "a",
      postNo: "11111",
      personalPhoneNo: "123456789",
      emergencyPhoneNo: "987654321",
      gotFavipiravia: 0,
      rf_copd_chronic_lung_disease: 0,
      rf_ckd_stagr_3_to_4: 0,
      rf_chronic_heart_disease: 0,
      rf_cva: 0,
      rf_t2dm: 0,
      rf_cirrhosis: 0,
      rf_immunocompromise: 0,
      fac_diabetes: 0,
      fac_dyslipidemia: 0,
      fac_hypertension: 0,
      fac_heart_diseases: 0,
      fac_esrd: 0,
      fac_cancer: 0,
      fac_tuberculosis: 0,
      fac_hiv: 0,
      fac_asthma: 0,
      fac_pregnancy: 0,
      createdDate: MOCK_DATE,
    };
    const lastFollowUp = {
      noAuth: true,
      lineIDToken:
        "eyJraWQiOiI2YWE4YWQwN2NkMmFhYWRjYzY1NmY3ZTIxMzljY2U4YjhjNGE2YzgxYzI5MDQyZjQ4MTY4MDY3MmZkMDNjOTY5IiwidHlwIjoiSldUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2FjY2Vzcy5saW5lLm1lIiwic3ViIjoiVWJhYTQxMmY3YjUxY2VjZDY0ZWIzYjlkMWMxZWVlZjE2IiwiYXVkIjoiMTY1NjI3MzMxNSIsImV4cCI6MTYyODAwODEwNCwiaWF0IjoxNjI4MDA0NTA0LCJhbXIiOlsibGluZXNzbyJdLCJuYW1lIjoiR1VZIiwicGljdHVyZSI6Imh0dHBzOi8vcHJvZmlsZS5saW5lLXNjZG4ubmV0LzBodXcwQU95VXpLbGdOT0R5WXdpNVZEekY5SkRWNkZpd1FkUWxnUG44OGR6d2lEVzBIT0ZnM2FpMXJKRDhuQ214Y013NHhQeWctY0dCMyJ9.TiV4_ldCBvngCM8uZO1unllXBq0t0tHTqaxCXZZAB_e4wUSE1tVBA_J5gf4nhfjxyvuWVBQIU-rwSmd9mBh5Aw",
      lineUserID: "T",
      sp_o2: 90,
      sp_o2_ra: 90,
      sp_o2_after_eih: 90,
      eih_result: "neutral",
      sym1_severe_cough: 0,
      sym1_chest_tightness: 0,
      sym1_poor_appetite: 0,
      sym1_fatigue: 0,
      sym1_persistent_fever: 0,
      sym2_tired_body_ache: 0,
      sym2_cough: 0,
      sym2_fever: 0,
      sym2_liquid_stool: 0,
      sym2_cannot_smell: 0,
      sym2_rash: 0,
      sym2_red_eye: 0,
      fac_bed_ridden_status: 0,
      fac_uri_symptoms: 0,
      fac_olfactory_symptoms: 0,
      fac_diarrhea: 0,
      fac_dyspnea: 0,
      fac_chest_discomfort: 0,
      fac_gi_symptoms: 0,
    };
    const payload = makeStatusAPIPayload(data, lastFollowUp);
    expect(calculateAgeMockFn).toBeCalledWith(data.birthDate.toDate());
    expect(formatDateTimeAPIMockFn).toBeCalledWith(data.createdDate);
    expect(
      payload ===
        "age=40&gender=male&height=180&weight=20&infected_discover_date=Sat%20Jan%2001%202000%2007%3A00%3A00%20GMT%2B0700&sp_o2=0.9&sp_o2_ra=0.9&sp_o2_after_eih=0.9&eih_result=neutral&sym1_severe_cough=0&sym1_chest_tightness=0&sym1_poor_appetite=0&sym1_fatigue=0&sym1_persistent_fever=0&rf_copd_chronic_lung_disease=0&rf_ckd_stage_3_to_4=0&rf_chronic_heart_disease=0&rf_cva=0&rf_t2dm=0&rf_cirrhosis=0&rf_immunocompromise=0&sym2_tired_body_ache=0&sym2_cough=0&sym2_fever=0&sym2_liquid_stool=0&sym2_cannot_smell=0&sym2_rash=0&sym2_red_eye=0&fac_diabetes=0&fac_dyslipidemia=0&fac_hypertension=0&fac_esrd=0&fac_cancer=0&fac_tuberculosis=0&fac_hiv=0&fac_asthma=0&fac_pregnancy=0&fac_bed_ridden_status=0&fac_uri_symptoms=0&fac_diarrhea=0&fac_dyspnea=0&fac_gi_symptoms=0" ||
        payload ===
          "age=40&gender=male&height=180&weight=20&infected_discover_date=Sat%20Jan%2001%202000%2000%3A00%3A00%20GMT%2B0000&sp_o2=0.9&sp_o2_ra=0.9&sp_o2_after_eih=0.9&eih_result=neutral&sym1_severe_cough=0&sym1_chest_tightness=0&sym1_poor_appetite=0&sym1_fatigue=0&sym1_persistent_fever=0&rf_copd_chronic_lung_disease=0&rf_ckd_stage_3_to_4=0&rf_chronic_heart_disease=0&rf_cva=0&rf_t2dm=0&rf_cirrhosis=0&rf_immunocompromise=0&sym2_tired_body_ache=0&sym2_cough=0&sym2_fever=0&sym2_liquid_stool=0&sym2_cannot_smell=0&sym2_rash=0&sym2_red_eye=0&fac_diabetes=0&fac_dyslipidemia=0&fac_hypertension=0&fac_esrd=0&fac_cancer=0&fac_tuberculosis=0&fac_hiv=0&fac_asthma=0&fac_pregnancy=0&fac_bed_ridden_status=0&fac_uri_symptoms=0&fac_diarrhea=0&fac_dyspnea=0&fac_gi_symptoms=0"
    ).toBe(true);
  });
});

describe("makeRequest", () => {
  const URL = "https://pedsanam.ydm.family/pedsanam/label_score";
  const formPayload = ["sdfsdf"];
  const { makeRequest } = require(".");
  const { statusList } = require("./const");

  it("should return expected mock data if axios success", async () => {
    // run make request
    const result = await makeRequest(formPayload);
    expect(mockPostFn).toBeCalledWith(URL, formPayload, {
      headers: {
        "API-KEY": AUTHORIZATION,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    expect(result).toEqual(MOCK_DATA);
  });

  it("should return at least label and status unknown if axios error", async () => {
    // run make request
    mockPostFn.mockImplementationOnce(() => {
      throw Error();
    });
    const result = await makeRequest(formPayload);
    expect(mockPostFn).toBeCalledWith(URL, formPayload, {
      headers: {
        "API-KEY": AUTHORIZATION,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    expect(result).toEqual({
      inclusion_label: statusList.unknown,
      inclusion_label_type: "at_least",
    });
  });
});
