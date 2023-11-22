import { useState, useEffect } from 'react'
import './App.css'
import { ChatOllama } from "langchain/chat_models/ollama";
import { ChatPromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { StructuredOutputParser } from "langchain/output_parsers";

const PROMPTS = {
  "system":
    `You are an expert translator. Format all responses as JSON objects with two keys: "original" and "translated".`,
  "human":
    `Translate "{input}" into {language}.`
}

function App() {
  const [translation, setTranslation] = useState('')
  const [history, setHistory] = useState([])
  const [inputText, setInputText] = useState('test') // New state for input text

  useEffect(() => {
    console.log(history);
  }, [history]);

  const fetchTranslation = async () => {
    let prompt;
    const humanMessage = ["human", PROMPTS["human"].replace("{input}", inputText).replace("{language}", "German")];
    if(history.length == 0) {
      prompt = ChatPromptTemplate.fromMessages([
        [
          "system",
          PROMPTS["system"],
        ],
        ["human", PROMPTS["human"]],
      ]);
      setHistory([[
        "system",
        PROMPTS["system"],
      ]])
    } else {
      const messages = [...history, ["human", PROMPTS["human"]]];
      prompt = ChatPromptTemplate.fromMessages(messages);
    }
  
    const model = new ChatOllama({
      baseUrl: "http://localhost:11434", // Default value
      model: "openhermes2.5-mistral", // Default value
      format: "json",
      stop: ["\n\n\n"],
    });
  
    const result = await prompt
      .pipe(model)
      .invoke({ input: inputText, language:'German'})

    const parsedResponse = JSON.parse(result.content).translated

    setHistory(prevHistory => [...prevHistory, humanMessage, ["ai", parsedResponse]]);

    setTranslation(parsedResponse); // Parse the result string as JSON
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline">TRANSLATOR</h1>
      <div>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} /> {/* New input field */}
        <button onClick={fetchTranslation}>
          Fetch translation
        </button>
        <p>
          Only does English to German for now
        </p>
        <p>
          Translation: {translation}
        </p>
      </div>

    </>
  )
}

export default App