import { useState, useEffect } from 'react'
import { fetchChat } from './services'

const PROMPTS = {
  "translation":
  {
    "system":
      `You are an expert translator. Format all responses as JSON objects with two keys: "original" and "translated".`,
    "human":
      `Translate "{input}" into {language}.`,
    "parserInput": {
      original: "The original text.",
      translated: "The translated text.",
    }
  }
}

function App() {
  const [translation, setTranslation] = useState('')
  const [history, setHistory] = useState([])
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    console.log(history);
  }, [history]);

  const fetchTranslation = async () => {
    const inputKeys = {
      input: inputText,
      language: "German",
    };
    const chatMessages = await fetchChat(inputKeys, history, PROMPTS["translation"]);
    setHistory(chatMessages);
    setTranslation(chatMessages[chatMessages.length - 1][1]);
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline">TRANSLATOR</h1>
      <div>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} />
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