import { ChatOllama } from "langchain/chat_models/ollama";
import { ChatPromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";


const fetchChat = async (inputKeys, chatHistory, prompts) => {
    let prompt, messages;
  
    if (chatHistory.length == 0) {
      messages = [
        ["system", prompts["system"]],
        ["human", prompts["human"]],
      ]
    } else {
      messages = [...chatHistory, ["human", prompts["human"]]];
    }
    prompt = ChatPromptTemplate.fromMessages(messages);
    const parser = StructuredOutputParser.fromNamesAndDescriptions(prompts["parserInput"]);

    const model = new ChatOllama({
      baseUrl: "http://localhost:11434",
      model: "openhermes2.5-mistral",
      format: "json",
      stop: ["\n\n\n"],
    });
  
    const result = await prompt
      .pipe(model)
      .pipe(parser)
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
  
    const newMessages = [...messages, ["ai", result["translated"]]];
  
    return newMessages;
  }

export { fetchChat };