import { ChainSlug } from "@alloralabs/allora-sdk";
import { GameAgent } from "@virtuals-protocol/game";
import AlloraPlugin from ".";


const alloraPlugin = new AlloraPlugin({
  apiClientConfig: {
    chainSlug: ChainSlug.TESTNET,
    apiKey: "UP-17f415babba7482cb4b446a1",
  },
});

// Create an agent with the worker
const agent = new GameAgent("API_KEY", {
  name: "Allora Worker",
  goal: "get price predictions and inferences from the Allora Network",
  description: "A worker that interacts with the Allora Network for retrieving price predictions and inferences from the active topics on the network.",
  workers: [
    alloraPlugin.getWorker({
      // Define the functions that the worker can perform, by default it will use the all functions defined in the plugin
      // functions: [
      //   twitterPlugin.searchTweetsFunction,
      //   twitterPlugin.replyTweetFunction,
      //   twitterPlugin.postTweetFunction,
      // ],
      // Define the environment variables that the worker can access, by default it will use the metrics defined in the plugin
      // getEnvironment: async () => ({
      //   ...(await twitterPlugin.getMetrics()),
      //   username: "virtualsprotocol",
      //   token_price: "$100.00",
      // }),
    }),
  ],
});

(async () => {
  agent.setLogger((agent, message) => {
    console.log(`-----[${agent.name}]-----`);
    console.log(message);
    console.log("\n");
  });

  await agent.init();

  while (true) {
    await agent.step({
      verbose: true,
    });
  }
})();
