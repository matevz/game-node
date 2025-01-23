"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/example.ts
var import_allora_sdk2 = require("@alloralabs/allora-sdk");
var import_game2 = require("@virtuals-protocol/game");

// src/alloraPlugin.ts
var import_allora_sdk = require("@alloralabs/allora-sdk");
var import_game = require("@virtuals-protocol/game");
var DEFAULT_API_KEY = "UP-17f415babba7482cb4b446a1";
var DEFAULT_BASE_API_URL = "https://api.allora.network/v2";
var AlloraPlugin = class {
  constructor(options) {
    var _a2, _b, _c;
    this.id = options.id || "allora_worker";
    this.name = options.name || "Allora Worker";
    this.description = options.description || "Worker that interacts with the Allora Network for retrieving price inferences and inferences from the active topics on the network.";
    this.alloraApiClient = new import_allora_sdk.AlloraAPIClient({
      chainSlug: (_a2 = options.apiClientConfig.chainSlug) != null ? _a2 : import_allora_sdk.ChainSlug.TESTNET,
      apiKey: (_b = options.apiClientConfig.apiKey) != null ? _b : DEFAULT_API_KEY,
      baseAPIUrl: (_c = options.apiClientConfig.baseApiUrl) != null ? _c : DEFAULT_BASE_API_URL
    });
  }
  getWorker(data) {
    return new import_game.GameWorker({
      id: this.id,
      name: this.name,
      description: this.description,
      functions: (data == null ? void 0 : data.functions) || [
        this.getAllTopics,
        this.getInferenceByTopicId,
        this.getPriceInference
      ],
      getEnvironment: data == null ? void 0 : data.getEnvironment
    });
  }
  get getAllTopics() {
    return new import_game.GameFunction({
      name: "get_all_topics",
      description: "Get all the topics available on Allora Network.",
      args: [],
      hint: "This function will return all the topics available on Allora Network.",
      executable: (_, logger) => __async(this, null, function* () {
        try {
          const topics = yield this.alloraApiClient.getAllTopics();
          const successMessage = `Successfully retrieved all topics from Allora Network. The topics available on Allora Network are:
 ${JSON.stringify(topics, null, 2)}`;
          logger(successMessage);
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Done,
            successMessage
          );
        } catch (e) {
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Failed,
            `An error occurred while fetching Allora Network topics: ${e.message || "Unknown error"}`
          );
        }
      })
    });
  }
  get getInferenceByTopicId() {
    return new import_game.GameFunction({
      name: "get_inference_by_topic_id",
      description: "Fetches an inference from Allora Network given a topic id.",
      args: [
        {
          name: "topicId",
          description: "The topic_id corresponds to the unique id of one of the active topics on Allora Network",
          type: "number"
        }
      ],
      executable: (args, logger) => __async(this, null, function* () {
        if (!args.topicId) {
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Failed,
            "Topic id is required"
          );
        }
        try {
          const inferenceRes = yield this.alloraApiClient.getInferenceByTopicID(Number(args.topicId));
          const inferenceValue = inferenceRes.inference_data.network_inference_normalized;
          const message = `Successfully retrieved inference for topic with id ${args.topicId}. The inference is: ${inferenceValue}`;
          logger(message);
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Done,
            message
          );
        } catch (e) {
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Failed,
            `An error occurred while fetching inference from Allora Network: ${e.message || "Unknown error"}`
          );
        }
      })
    });
  }
  get getPriceInference() {
    return new import_game.GameFunction({
      name: "get_price_inference",
      description: "Fetches from Allora Network the future price inference for a given crypto asset and timeframe.",
      args: [
        { name: "asset", description: "The crypto asset symbol to get the price inference for. Example: BTC, ETH, SOL, SHIB, etc." },
        {
          name: "timeframe",
          description: "The timeframe to get the price inference for. Example: 5m, 8h etc."
        }
      ],
      executable: (args, logger) => __async(this, null, function* () {
        var _a2, _b;
        try {
          const asset = (_a2 = args.asset) == null ? void 0 : _a2.toUpperCase();
          const timeframe = (_b = args.timeframe) == null ? void 0 : _b.toLowerCase();
          if (!asset) {
            return new import_game.ExecutableGameFunctionResponse(
              import_game.ExecutableGameFunctionStatus.Failed,
              "Asset is required"
            );
          }
          const supportedTokens = Object.values(import_allora_sdk.PriceInferenceToken);
          if (!supportedTokens.includes(asset)) {
            return new import_game.ExecutableGameFunctionResponse(
              import_game.ExecutableGameFunctionStatus.Failed,
              `Asset ${args.asset} is not supported. Supported assets are: ${supportedTokens.join(", ")}`
            );
          }
          if (!timeframe) {
            return new import_game.ExecutableGameFunctionResponse(
              import_game.ExecutableGameFunctionStatus.Failed,
              "Timeframe is required"
            );
          }
          const supportedTimeframes = Object.values(import_allora_sdk.PriceInferenceTimeframe);
          if (!supportedTimeframes.includes(args.timeframe)) {
            return new import_game.ExecutableGameFunctionResponse(
              import_game.ExecutableGameFunctionStatus.Failed,
              `Timeframe ${args.timeframe} is not supported. Supported timeframes are: ${supportedTimeframes.join(", ")}`
            );
          }
          logger(`Fetching price inference for ${asset} on Allora Network for ${timeframe} timeframe`);
          const inference = yield this.alloraApiClient.getPriceInference(asset, timeframe);
          const message = `The price inference for ${asset} in ${timeframe} is: ${inference.inference_data.network_inference_normalized}`;
          logger(message);
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Done,
            message
          );
        } catch (e) {
          return new import_game.ExecutableGameFunctionResponse(
            import_game.ExecutableGameFunctionStatus.Failed,
            `An error occurred while fetching ${args.asset} ${args.timeframe} price inference from Allora Network: ${e.message || "Unknown error"}`
          );
        }
      })
    });
  }
};
var alloraPlugin_default = AlloraPlugin;

// src/index.ts
var index_default = alloraPlugin_default;

// src/example.ts
var alloraPlugin = new index_default({
  apiClientConfig: {
    chainSlug: process.env.ALLORA_CHAIN_SLUG,
    apiKey: process.env.ALLORA_API_KEY
    // Default key: UP-17f415babba7482cb4b446a1
  }
});
var _a;
var agent = new import_game2.GameAgent((_a = process.env.GAME_API_KEY) != null ? _a : "", {
  name: "Allora Worker",
  goal: "Get the 5m price inference for BTC and Luna from Allora Network.",
  description: `You are an AI agent specialized in Allora Network.
You are able to get price inferences from Allora Network and provide users insights into future price of different crypto assets.
You are able to get details about the topics deployed on Allora Network and provide users insights into the topics.
For all the active topics, you are able to get the latest inference using the topic id.
The available assets for price inferences worker are ${Object.values(import_allora_sdk2.PriceInferenceToken).join(", ")};
for the following timeframes: ${Object.values(import_allora_sdk2.PriceInferenceTimeframe).join(", ")}.
If a price inference is not available for a specific asset and timeframe,
you should determine the topic id for the asset and timeframe and use the topics inferences worker to get the latest inference 
for the specified asset and timeframe. This will return the equivalent of a price inference for the asset and timeframe.
  `,
  workers: [
    alloraPlugin.getWorker({})
  ]
});
(() => __async(exports, null, function* () {
  agent.setLogger((agent2, message) => {
    console.log(`-----[${agent2.name}]-----`);
    console.log(message);
    console.log("\n");
  });
  yield agent.init();
  while (true) {
    yield agent.step({
      verbose: true
    });
  }
}))();
