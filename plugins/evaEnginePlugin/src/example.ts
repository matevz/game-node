import { GameAgent } from "@virtuals-protocol/game";

import dotenv from "dotenv";
dotenv.config();

// import TwitterPlugin from "@virtuals-protocol/game-evalengine-twitter-plugin";
import TwitterPlugin from "./index";
import { initEvalClient } from "./evalEngine";

const {
  X_API_KEY,
  X_API_KEY_SECRET,
  X_ACCESS_TOKEN,
  X_ACCESS_TOKEN_SECRET,
  VIRTUALS_API_KEY,
  PRIVATE_KEY,
} = process.env;

// Validate required environment variables
if (
  !X_API_KEY ||
  !X_API_KEY_SECRET ||
  !X_ACCESS_TOKEN ||
  !X_ACCESS_TOKEN_SECRET ||
  !VIRTUALS_API_KEY
) {
  throw new Error(
    "Missing required environment variables. Please check your .env file."
  );
}

(async () => {
  // Uncomment and validate PRIVATE_KEY if initEvalClient is needed
  if (!PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY environment variable");
  }
  const evalClient = await initEvalClient(PRIVATE_KEY);

  // Create a worker with the functions
  const twitterPlugin = new TwitterPlugin({
    credentials: {
      apiKey: X_API_KEY,
      apiSecretKey: X_API_KEY_SECRET,
      accessToken: X_ACCESS_TOKEN,
      accessTokenSecret: X_ACCESS_TOKEN_SECRET,
    },
    thresholdScore: 0.5,
    evalClient,
  });

  // Create an agent with the worker
  const agent = new GameAgent(VIRTUALS_API_KEY, {
    name: "Twitter Bot",
    goal: "increase engagement and grow follower count",
    description: "A bot that can post tweets, reply to tweets, and like tweets",
    workers: [
      twitterPlugin.getWorker({
        // Define the functions that the worker can perform, by default it will use the all functions defined in the plugin
        functions: [
          // twitterPlugin.searchTweetsFunction,
          twitterPlugin.replyTweetFunction,
          twitterPlugin.postTweetFunction,
        ],
        // Define the environment variables that the worker can access, by default it will use the metrics defined in the plugin
        // getEnvironment: async () => ({
        //   ...(await twitterPlugin.getMetrics()),
        //   username: "virtualsprotocol",
        //   token_price: "$100.00",
        // }),
      }),
    ],
  });

  agent.setLogger((agent, message) => {
    console.log(`-----[${agent.name}]-----`);
    console.log(message);
    console.log("\n");
  });

  await agent.init();

  let stepCount = 0;

  // ctrl + c to stop
  process.on("SIGINT", () => {
    console.log("========= Stopping ========");
    process.exit(0);
  });

  while (true) {
    console.log(`========= Step ${stepCount} Initiated ========`);
    await agent.step({
      verbose: true,
    });
    console.log(`========= Step ${stepCount} Completed ========`);
    // in Terminal press enter to continue next step
    process.stdin.resume();
    process.stdin.on("data", () => {
      process.exit(0);
    });
  }
})();
