import { CHROMIA_CHAIN, EvaClient } from "@superoo7/eva-sdk";

export const initEvaClient = async (privateKey: string) => {
  const evaClient = await EvaClient.init(privateKey, CHROMIA_CHAIN.MAINNET, {
    url: "https://api.evaengine.ai/api/v1",
    prefix: "EVA",
    pub: "026822066B64608E0A6E071D8AE76BDE509011FF823DBBF9FD6AC2E1F202904A0A",
  });

  return evaClient;
};
