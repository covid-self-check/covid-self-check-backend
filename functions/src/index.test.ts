describe("endpoints", () => {
  jest.doMock("./config/index", () => ({
    default: {
      region: "region",
      line: {
        channelAccessToken: "channel_token",
        channelSecret: "channel_secret",
        r2rUri: "r2r_uri",
      },
    },
  }));
  jest.doMock("firebase-functions", () => ({
    config: () => ({
      line: {
        channel_token: "channel_token",
        channel_secret: "channel_secret",
        r2r_uri: "r2r_uri",
      },
      api: { authorization: "authorization" },
    }),
    region: () => ({
      https: {
        onRequest: jest.fn(),
        onCall: jest.fn(),

      },
      firestore: {
        document: jest.fn(() => ({
          onCreate: jest.fn(),
          onUpdate: jest.fn(),
          onDelete: jest.fn()
        }))
      },
      pubsub: {
        schedule: () => ({ timeZone: () => ({ onRun: jest.fn() }) }),
      },
    }),
  }));

  require(".");

  it("should run something useful (will implement in future", () => {
    expect(true).toBe(true);
  });
});
