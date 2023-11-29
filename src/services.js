import { ChatOllama } from "langchain/chat_models/ollama";
import { ChatPromptTemplate } from "langchain/prompts";

const fetchChat = async (inputKeys, chatHistory, prompts) => {
    // AI model. All parsing should happen outside of this function.
    // Always return an array of messages, with the last message being the AI's response.
    let prompt, messages;

    console.log(inputKeys);
  
    if (chatHistory.length == 0) {
      messages = [
        ["system", prompts["system"]],
        ["human", prompts["human"]],
      ]
    } else {
      messages = [...chatHistory, ["human", prompts["human"]]];
    }
    prompt = ChatPromptTemplate.fromMessages(messages);

    const model = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "openhermes2.5-mistral",
      format: prompts["mode"] || null,
      stop: ["\n\n\n", "<|im_end|>"],
    });
  
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
    console.log(newMessages);
  
    return newMessages;

  }

export { fetchChat };