import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const QUESTION = "现在我应该去玩什么运动？";

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

  chooseASportAccordingToTime: function (time) {
    // time is like 10:30
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 6 && hour < 12) {
      return "running";
    }
    if (hour >= 12 && hour < 18) {
      return "swimming";
    }
    if (hour >= 18 && hour < 24) {
      return "basketball";
    }
  },
};

const getCompletion = async (messages) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions: [
      // tools.SerpAPI.desc 用于获取搜索引擎结果
      {
        name: "getCurrentTime",
        description: "Get the current time",
        parameters: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "chooseASportAccordingToTime",
        description: "Choose a sport according to the time",
        parameters: {
          type: "object",
          properties: {
            time: {
              type: "string",
              description: "The current time",
            },
          },
        },
      },
    ],
    temperature: 0,
  });

  return response;
};

let response;

console.log("Question: " + QUESTION);

while (true) {
  response = await getCompletion(messages);

  if (response.data.choices[0].finish_reason === "stop") {
    console.log(response.data.choices[0].message.content);
    break;
  } else if (response.data.choices[0].finish_reason === "function_call") {
    const fnName = response.data.choices[0].message.function_call.name;
    const args = response.data.choices[0].message.function_call.arguments;

    const fn = functions[fnName];
    const result = fn(...Object.values(JSON.parse(args)));

    console.log(`Calling Function ${fnName} Result: ` + result);

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
