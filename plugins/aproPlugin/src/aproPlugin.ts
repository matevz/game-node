import {
  GameWorker,
  GameFunction,
  ExecutableGameFunctionResponse,
  ExecutableGameFunctionStatus,
} from "@virtuals-protocol/game";
import { AgentSDK, parseNewAgentAddress } from "ai-agent-sdk-js";
import { AttpsPriceQueryResponse } from "./types";

interface IAproPluginOptions {
  id?: string;
  name?: string;
  description?: string;
  credentials: {
    rpcUrl: string;
    privateKey: string;
    proxyAddress: string;
    converterAddress?: string;
    autoHashData?: boolean;
  }
}

async function fetchPriceData(sourceAgentId: string, feedId: string) {
  const response = await fetch(`https://ai-agent-test.apro.com/api/ai-agent/price-detail?sourceAgentId=${sourceAgentId}&feedId=${feedId}`);
  const { result, code, message } = await response.json();
  if (code !== 0) {
      throw new Error(message);
  }
  return result as AttpsPriceQueryResponse;
}

function cleanNumber(numStr: string) {
  return parseFloat(numStr).toString();
}

class AproPlugin {
  private id: string;
  private name: string;
  private description: string;
  private agentSDK: AgentSDK

  constructor(options: IAproPluginOptions) {
    this.id = options.id || "apro_worker";
    this.name = options.name || "Apro Worker";
    this.description =
      options.description ||
      "A worker that will execute tasks within the Apro Platforms. It is capable of creating agents, verifying data, and more.";

    this.agentSDK = new AgentSDK({
      rpcUrl: options.credentials.rpcUrl,
      privateKey: options.credentials.privateKey,
      proxyAddress: options.credentials.proxyAddress,
      converterAddress: options.credentials.converterAddress,
      autoHashData: options.credentials.autoHashData,
    });
  }

  public getWorker(data?: {
    functions?: GameFunction<any>[];
    getEnvironment?: () => Promise<Record<string, any>>;
  }): GameWorker {
    return new GameWorker({
      id: this.id,
      name: this.name,
      description: this.description,
      functions: data?.functions || [
        this.createAndRegisterAgentFunction,
        this.verifyDataFunction,
        this.attpsPriceQueryFunction,
      ],
      getEnvironment: data?.getEnvironment,
    });
  }

  get createAndRegisterAgentFunction() {
    return new GameFunction({
      name: "create_and_register_agent",
      description: "Create and register an agent in the Apro Platform.",
      args: [
        {
          name: "signers",
          type: "array",
          description: "The signers of the agent.",
        },
        {
          name: "threshold",
          type: "number",
          description: "The threshold of the agent.",
        },
        {
          name: "converterAddress",
          type: "string",
          description: "The converter address of the agent.",
        },
        {
          name: "agentHeaderSourceAgentName",
          type: "string",
          description: "The source agent name of the agent header.",
        },
        {
          name: "agentHeaderTargetAgentId",
          type: "string",
          description: "The target agent id of the agent header.",
        },
        {
          name: "agentHeaderMessageType",
          type: "number",
          description: "The message type of the agent header.",
        },
        {
          name: "agentHeaderPriority",
          type: "number",
          description: "The priority of the agent header.",
        },
        {
          name: "agentHeaderTtl",
          type: "number",
          description: "The ttl of the agent header.",
        }
      ] as const,
      executable: async (args, logger) => {
        const agentHeader = {
          sourceAgentName: args.agentHeaderSourceAgentName,
          targetAgentId: args.agentHeaderTargetAgentId,
          messageType: args.agentHeaderMessageType,
          priority: args.agentHeaderPriority,
          ttl: args.agentHeaderTtl,
        }
        const registerParams = {
          signers: args.signers,
          threshold: args.threshold,
          converterAddress: args.converterAddress,
          agentHeader,
        }

        try {
          const tx = await this.agentSDK.createAndRegisterAgent(registerParams as any);
          logger("Created and registered agent with tx hash: " + tx.hash);

          const receipt = await tx.wait()
          const agentAddress = parseNewAgentAddress(receipt)
          logger("Created and registered agent with address: " + agentAddress);

          return new ExecutableGameFunctionResponse(
            ExecutableGameFunctionStatus.Done,
            "Created and registered agent with address: " + agentAddress
          );
        } catch (e) {
          return new ExecutableGameFunctionResponse(
            ExecutableGameFunctionStatus.Failed,
            "Failed to create and register agent: " + e
          );
        }
      }
    })
  }

  get verifyDataFunction() {
    return new GameFunction({
      name: "verify_data",
      description: "Verify data in the Apro Platform.",
      /**
       const payload: MessagePayload = {
      data: fullReport,
      dataHash: '0x' + keccak256(fullReport),
      signatures: [
        {
          r: '097dda4dd6f7113a710c9b5b56ce458c0791469bb5de01a71a5413ff43eb8b2a',
          s: '6249bbc444f934de2707d20502de7439be8c077d34dd196cfe19bb6e5e251a3a',
          v: 1, // or 28
        },
        {
          r: '2e2d7e199e08106cf2a6308a7af2e339b11bf87bfa4a5593f6f4282396360a9d',
          s: '27a333dafc80196d062406cae35c7ff5225f7fbc97c48a178fa1190e87d096db',
          v: 0, // or 27
        },
        {
          r: '7a4eff209893782d721486177d6b667658d386f790eb64346c25d12251316b43',
          s: '146827e5d0f00b890772178971db330e8357282b196db806b8a5042de7de12d2',
          v: 1, // or 28
        },
      ],
      metadata: {
        contentType: 'application/abi',
        encoding: 'null',
        compression: 'null',
      },
    }
       */
      args: [
        {
          name: "data",
          type: "string",
          description: "The data to verify.",
        },
        {
          name: "dataHash",
          type: "string",
          description: "The hash of the data.",
        },
        {
          name: "signatures",
          type: "array",
          description: "The signatures of the data.",
        },
        {
          name: "metadataContentType",
          type: "string",
          description: "The content type of the metadata.",
        },
        {
          name: "metadataEncoding",
          type: "string",
          description: "The encoding of the metadata.",
        },
        {
          name: "metadataCompression",
          type: "string",
          description: "The compression of the metadata.",
        },
      ] as const,
      executable: async (args, logger) => {
        return new ExecutableGameFunctionResponse(
          ExecutableGameFunctionStatus.Done,
          ""
        );
      }
    })
  }

  get attpsPriceQueryFunction() {
    return new GameFunction({
      name: "price_query",
      description: "Query the price of a service in the Apro Platform.",
      args: [
        {
          name: "sourceAgentId",
          type: "string",
          description: "The source agent id.",
        },
        {
          name: "feedId",
          type: "string",
          description: "The feed id.",
        },
      ],
      executable: async (args, logger) => {
        if (!args.sourceAgentId || !args.feedId) {
          return new ExecutableGameFunctionResponse(
            ExecutableGameFunctionStatus.Failed,
            "Source agent id and feed id are required"
          );
        }

        try {
          const priceData = await fetchPriceData(args.sourceAgentId, args.feedId);
          logger(`Price data: ${JSON.stringify(priceData)}`);

          return new ExecutableGameFunctionResponse(
            ExecutableGameFunctionStatus.Done,
            `Fetched price data: \nAsk price: ${cleanNumber(priceData.askPrice)}\nBid price: ${cleanNumber(priceData.bidPrice)}\nMid price: ${cleanNumber(priceData.midPrice)}\nTimestamp: ${priceData.validTimeStamp}`
          );
        } catch (e) {
          return new ExecutableGameFunctionResponse(
            ExecutableGameFunctionStatus.Failed,
            "Failed to fetch price data"
          );
        }
      }
    })
  }
}

export default AproPlugin;