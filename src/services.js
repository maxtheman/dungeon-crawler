import { ChatOllama } from "langchain/chat_models/ollama";
import { ChatPromptTemplate } from "langchain/prompts";

const fetchChat = async (inputKeys, chatHistory, prompts) => {
    // AI model. All parsing should happen outside of this function.
    // Always return an array of messages, with the last message being the AI's response.
    let prompt, messages;

    const systemPromptPresent = (chatHistory.length > 0 && chatHistory[0].length > 0 && chatHistory[0][0] == 'system')  ? true : false
  
    if (!systemPromptPresent) {
      if(chatHistory.length === 0)
      // construct history if no chat history is provided
        messages = [
          ["system", prompts["system"]],
          ["human", prompts["human"]],
        ]
      else {
        messages = [
          ["system", prompts["system"]],
          ...chatHistory
        ]
      }
    } else {
      messages = chatHistory
    }
    prompt = ChatPromptTemplate.fromMessages(messages)

    const model = new ChatOllama({
      baseUrl: "http://127.0.0.1:11434",
      model: "openhermes2.5-mistral",
      format: prompts["mode"] || null,
      stop: ["\n\n\n", "<|im_end|>"],
    });

    // add check here to ensure that inputKeys are all here.

    const result = await prompt
      .pipe(model)
      .invoke(inputKeys);

    // Replace keys dynamically in all messages
    Object.keys(inputKeys).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i][1].includes(`{${key}}`)) {
          messages[i][1] = messages[i][1].replace(regex, inputKeys[key]);
          break;
        }
      }
    });

    const newMessages = [...messages, ["ai", result.content]];

    return newMessages;

  }

export { fetchChat };