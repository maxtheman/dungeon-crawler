import { fetchChat } from '../src/services';
import { expect, test } from 'vitest';

const PROMPTS = {
    "translation": {
      "system":
        `You are an expert translator. Format all responses as JSON objects with two keys: "original" and "translated".`,
      "human":
        `Translate "{input}" into {language}.`,
      "mode": "json",
    },
  "teacher":
  {
    "system":
    `You are a helpful language teacher. Here's information relevant to the student's question - the translation they requested is: {info} in German. Please teach them the content to the best of your ability, socratic method is encouraged.`,
      "human": `{message}`,
    },
  }

test('fetchChat returns correct chat history in JSON', async () => {
  const inputKeys = {
    input: 'Hello',
    language: 'German',
  };
  const chatHistory = [];
  const expectedChat = [
    ["system", PROMPTS["translation"]["system"]],
    ["human", `Translate "Hello" into German.`],
  ];
  const result = await fetchChat(inputKeys, chatHistory, PROMPTS["translation"]);
  expect(result.slice(0, 2)).toEqual(expectedChat);
});

test('fetchChat works in non-json mode', async () => {
const inputKeys = {
    input: 'Hello',
    language: 'German',
};
const chatHistory = [];
const expectedChat = [
    ["system", PROMPTS["translation"]["system"]],
    ["human", `Translate "Hello" into German.`],
];
const result = await fetchChat(inputKeys, chatHistory, PROMPTS["translation"]);
expect(result.slice(0, 2)).toEqual(expectedChat);
}
)