import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const QUESTION = "现在几点？";

const messages = [
  {
    role: "user",
    content: QUESTION,
  },
];

// Define the functions that you want to be able to call from the chat
// 定义 chatGPT 可以使用的函数
const functions = {
  // 获取当前时间
  // get current time
  getCurrentTime: function () {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    var time = hours + ":" + minutes;

    return time;
  },
};

const getCompletion = async (messages) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions: [
      {
        name: "getCurrentTime",
        description: "Get the current time",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    ],
    temperature: 0,
  });

  return response;
};

let response = await getCompletion(messages);

if (response.data.choices[0].finish_reason === "function_call") {
  const fnName = response.data.choices[0].message.function_call.name;
  const args = response.data.choices[0].message.function_call.arguments;

  console.log("Function call: " + fnName);
  console.log("Arguments: " + args);

  // call the function
  const fn = functions[fnName];
  const result = fn(...Object.values(args));

  console.log("Calling Function Result: " + result);

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

  // call the completion again
  response = await getCompletion(messages);

  console.log(response.data.choices[0].message.content);
}
