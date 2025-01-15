import Replicate from "replicate";

interface args {
  userPrompt: string;
  systemPrompt?: string;
  settings: {
    apiKey: string;
    model: `${string}/${string}` | `${string}/${string}:${string}`;
    seed?: number;
    top_k?: number; // default 0
    top_p?: number; // default 0.95
    temperature?: number; // default 0.7
    length_penalty?: number; // default 1
    presense_penalty?: number; // default 0
    maxTokens?: number; // default 128
    minTokens?: number;
    stopSequences?: Array<string>;
  };
}

export default async function name(arg: args) {
  try {
    const { userPrompt, systemPrompt, settings } = arg;

    const replicate = new Replicate({ auth: settings.apiKey });
    const input = {
      system_prompt: systemPrompt,
      prompt: userPrompt,
      seed: settings.seed,
      top_k: settings.top_k,
      top_p: settings.top_p,
      temperature: settings.temperature,
      length_penalty: settings.length_penalty,
      max_new_tokens: settings.maxTokens,
      min_new_tokens: settings.minTokens,
      stop_sequences: settings.stopSequences,
      presense_penalty: settings.presense_penalty,
    };

    const output = await replicate.run(settings.model, {
      input: input,
    });

    return output;
  } catch (error) {
    console.log("ReplicateChatClient", error);
    throw new Error(`Please contact support team`);
  }
}
