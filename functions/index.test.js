describe("endpoints", () => {
  jest.doMock("./config/index", () => ({
    config: {
      region: "region",
    },
  }));
  jest.doMock("firebase-functions", () => ({
    config: () => ({
      line: {
        channel_token: "channel_token",
        channel_secret: "channel_secret",
      },
      api: { authorization: "authorization" },
    }),
    region: () => ({
      https: {
        onRequest: jest.fn(),
        onCall: jest.fn(),
      },
      pubsub: {
        schedule: () => ({ timeZone: () => ({ onRun: jest.fn() }) }),
      },
    }),
  }));

  jest.doMock("./backup", () => ({
    backup: jest.fn(),
  }));
  const index = require(".");

  it("should run something useful (will implement in future", () => {
    expect(true).toBe(true);
  });
});
