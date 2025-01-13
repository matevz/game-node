import { CHROMIA_CHAIN, EvaClient } from "@superoo7/eva-sdk";

export let evaClient: EvaClient;

export const initEvaClient = async (privateKey: string) => {
  evaClient = await EvaClient.init(privateKey, CHROMIA_CHAIN.MAINNET, {
    url: "http://localhost:8000",
    prefix: "EVAL",
    pub: "https://pub.chromia.com",
  });
};
