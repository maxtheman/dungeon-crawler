import { useState, useEffect } from 'react'
import { createMachine, state, transition, interpret, invoke } from 'robot3'
import { useMachine } from 'react-robot';
import { fetchChat } from './services'


const gameContext = initialContext => ({
  chatHistory: initialContext.chatHistory
})

const gameMachine = createMachine({
  start: state(
    transition('START', 'playerTurn')
  ),
  playerTurn: state(
    transition('PLAYER_ACTION', 'enemyTurn')
  ),
  enemyTurn: state(
    transition('ENEMY_ACTION', 'playerTurn')
  ),
  end: state()
}, gameContext)

function App() {
  let initialContext = { chatHistory: ["Start"]}
  const [inputText, setInputText] = useState('')
  const [current, send] = useMachine(gameMachine, initialContext)

  return (
    <div className="p-6 space-y-8">
      <p className="text-xl">Current State: {current.name}</p>
      <h1 className="text-3xl font-bold underline">Monster Battle</h1>
      {current.name === 'start' && (
        <div>
          <p>Welcome to Monster Battle! Click the button to fight a monster.</p>
          <button onClick={() => send('START')}>Start</button>
        </div>
      )}
      {current.name === 'playerTurn' && (
        <div>
          <input
            type="text"
            className="input-bordered"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your response here..."
          />
          <button onClick={() => send('PLAYER_ACTION', inputText)}>Send</button>
        </div>
      )}
      {current.name === 'enemyTurn' && (
        <div>
          <p>Enemy is thinking...</p>
          <button onClick={() => send('ENEMY_ACTION')}>Continue</button>
        </div>
      )}
      {current.context.chatHistory.map((message, index) => (
        <div key={index} className={`chat ${index % 2 === 0 ? 'chat-start' : 'chat-end'}`}>
          <div className="chat-bubble">
            {message}
          </div>
        </div>
      ))}
    </div>
  )
}

export default App