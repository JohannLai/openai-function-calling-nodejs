import { Configuration, OpenAIApi } from "openai";
import { JavaScriptInterpreter } from "openai-function-calling-tools"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const QUESTION = "What is 0.1 + 0.2 ?";
const messages = [
  {
    role: "user",
    content: QUESTION,
  },
];

const { javaScriptInterpreter, javaScriptInterpreterSchema } =
  new JavaScriptInterpreter();

const functions = {
  javaScriptInterpreter,
};

const getCompletion = async (messages) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions: [javaScriptInterpreterSchema],
    temperature: 0,
  });

  return response;
};

console.log("Question: " + QUESTION);

let response;
while (true) {
  response = await getCompletion(messages);
  const { finish_reason, message } = response.data.choices[0];

  if (finish_reason === "stop") {
    console.log(message.content);
    break;
  } else if (finish_reason === "function_call") {
    const { name: fnName, arguments: args } = message.function_call;

    const fn = functions[fnName];
    const parsedArgs = JSON.parse(args);
    const argValues = Object.values(parsedArgs);
    const result = await fn(...argValues);

    messages.push({
      role: "assistant",
      content: null,
      function_call: {
        name: fnName,
        arguments: args,
      },
    });

    messages.push({
      role: "function",
      name: fnName,
      content: JSON.stringify({ result: result }),
    });
  }
}
