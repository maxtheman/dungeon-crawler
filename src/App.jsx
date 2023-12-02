import { useState } from 'react'
import { createMachine, state, transition, action, invoke, reduce } from 'robot3'
import { useMachine } from 'react-robot';
import { fetchChat } from './services'

const print = async (ctx) => (
  console.log(ctx)
)

const PROMPTS = {
  "setting":
  {
    "system":
      `You are the dungeon master for a game that is starting. Please generate an elaborate setting based on the player's request. Be concise yet descriptive. Do not generate anything other than the setting or you will break the game. Do not over-narrate or editorialize, describe only what is necessary.`,
    "human":
      `{lastPlayerAction}`,
  },
  "character":
  {
    "system":
      `You are the dungeon master for a game that is starting. Please describe the player's attributes in the with the keys: 'name': string, 'backstory': string, and 'immediateLocation': string ±where immediateLocation is where they are and what they are doing right now. Be concise yet descriptive. Only describe single option for the player, and only describe up to the point where the adventure is starting for the player, continuing beyond that will break the game. Be specific and inventive! Do not generate anything other than the setting or you will break the game. Do not over-narrate or editorialize, describe only what is necessary.`,
      "mode": "json",

  },
  "monster":
  {
    "system":
      `You are the dungeon master for a game that is now in progress. The player now will enter combat with a monster. This MUST be a hostile encounter, failing to make the encounter hostile will confuse the player and break the game. Be concise yet descriptive. Describe the monster and how it starts to attack. Then, let the player react. You must describe a monster attack. Failing to do so will break the game. Do not generate anything other than the setting or you will break the game. Do not over-narrate or editorialize, describe only what is necessary.`,
  },
  "enemy": {
    "system":
      `You are roleplaying as a monster that the human player is fighting against. Describe your actions in response to the player. Be concise, yet descriptive.`,
    "human":
      `{lastPlayerAction}`,
  }
}

const createSetting = async (ctx) => {
  const settingKeys = { lastPlayerAction: ctx.lastPlayerAction }
  const result = await fetchChat(settingKeys, ctx.chatHistory, PROMPTS["setting"]);
  return result.slice(1)
}

const createCharacter = async (ctx) => {
  const result = await fetchChat({}, ctx.chatHistory, PROMPTS["character"]);
  const jsonResult = JSON.parse(result[result.length - 1][1])
  return {
    newMessages: [['ai', jsonResult['backstory']], ['ai',jsonResult['immediateLocation']]],
    character: {
      name: jsonResult['name'],
      health: 100,
      created: true
    }
  }
}

const createMonster = async (ctx) => {
  const result = await fetchChat({}, ctx.chatHistory, PROMPTS["monster"]);
  return result.slice(1)
}


const enemyChat = async (ctx) => {
  const inputKeys = { lastPlayerAction: ctx.lastPlayerAction }
  const result = await fetchChat(inputKeys, ctx.chatHistory, PROMPTS['enemy']);
  //shift to strip system prompt
  return result.slice(1)
}

const gameContext = initialContext => ({
  chatHistory: initialContext.chatHistory,
  lastPlayerAction: initialContext.lastPlayerAction,
  character: initialContext.character
})

const gameMachine = createMachine({
  start: state(
    transition('PLAYER_ACTION', 'setting',
      reduce((ctx, ev) => ({
        ...ctx,
        lastPlayerAction: ev.data
      })))
  ),
  setting: invoke(createSetting,
    transition('done', 'character',
      action(print),
      reduce((ctx, ev) => ({ ...ctx, chatHistory: ev.data }))
    )),
  character: invoke(createCharacter,
    transition('done', 'monster',
      action(print),
      reduce((ctx, ev) => ({ ...ctx, chatHistory: [...ctx.chatHistory, ...ev.data.newMessages], character: ev.data.character}))
    )),
  monster: invoke(createMonster,
    transition('done', 'playerTurn',
      action(print),
      reduce((ctx, ev) => ({ ...ctx, chatHistory: ev.data }))
    )),
  playerTurn: state(
    transition('PLAYER_ACTION', 'enemyTurn',
      action(print),
      reduce(
        (ctx, ev) => ({
          ...ctx,
          chatHistory: [...ctx.chatHistory, ['human', ev.data]],
          lastPlayerAction: ev.data
        })
      ))
  ),
  enemyTurn: invoke(enemyChat,
    transition('done', 'playerTurn',
      action(print),
      reduce((ctx, ev) => ({ ...ctx, chatHistory: ev.data })))
  ),
  end: state()
}, gameContext)

function App() {
  let initialContext = {
    chatHistory: [],
    lastPlayerAction: '',
    character: {
      created: false,
      health: 0,
      name: '',
    }
  }
  const [inputText, setInputText] = useState('')
  const [current, send] = useMachine(gameMachine, initialContext)

  const endTurn = () => {
    send({ type: 'PLAYER_ACTION', data: inputText })
    setInputText('')
  }

  return (
    <div className="p-6 space-y-8">
      <p className="text-xl">Current State: {current.name}</p>
      {current.context.character.created && (
        <div>
          <p>{current.context.character.name}</p>
          <p>{current.context.character.health} HP</p>
        </div>
      )}
      <ul></ul>
      <h1 className="text-3xl font-bold underline">Monster Battle</h1>
      {current.context.chatHistory && current.context.chatHistory
        .filter(message => message[0] !== 'system')
        .map((message, index) => (
          <div key={index} className={`chat ${message[0] !== 'human' ? 'chat-start' : 'chat-end'}`}>
            <div className="chat-bubble">
              {message[1]}
            </div>
          </div>
        ))}
      {current.name === 'setting' && (
        <div>
          <p>Creating your story!</p>
        </div>
      )}
      {current.name === 'start' && (
        <div>
          <p>Welcome to Monster Battle! Describe the setting your fight should take place in.</p>
          <input
            type="text"
            className="input-bordered"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your action here..."
          />
          <button onClick={() => endTurn()}>Start</button>
        </div>
      )}
      {current.name === 'playerTurn' && (
        <div>
          <input
            type="text"
            className="input-bordered"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your action here..."
          />
          <button onClick={() => endTurn()}>Send</button>
        </div>
      )}
      {current.name === 'enemyTurn' && (
        <div>
          <p>Enemy is thinking...</p>
        </div>
      )}
    </div>
  )
}

export default App