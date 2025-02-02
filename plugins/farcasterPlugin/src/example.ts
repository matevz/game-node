import { GameAgent } from "@virtuals-protocol/game";
import FarcasterPlugin from "./farcasterPlugin";

// Create a worker with the functions
const farcasterPlugin = new FarcasterPlugin({
  credentials: {
    neynarApiKey: "xxxxxxx",
  },
});

// Create an agent with the worker
const agent = new GameAgent("API_KEY", {
  name: "Farcaster Bot",
  goal: "increase engagement and grow follower count on Farcaster",
  description: "A bot that can post casts, reply to casts, and like casts on Farcaster",
  workers: [
    farcasterPlugin.getWorker({
      // Define the functions that the worker can perform, by default it will use the all functions defined in the plugin
      functions: [
        farcasterPlugin.postCastFunction,
      ],
      // Define the environment variables that the worker can access, by default it will use the metrics defined in the plugin
      // getEnvironment: async () => ({
      //   ...(await farcasterPlugin.getMetrics()),
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
