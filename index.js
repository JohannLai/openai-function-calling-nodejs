import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const QUESTION =
  "What's the result of 22 plus 5 in decimal added to the hexadecimal number A?";

const messages = [
  {
    role: "user",
    content: QUESTION,
  },
];

// Define the functions that you want to be able to call from the chat
// 定义了两个函数，分别用于将十进制和十六进制的值相加
const functions = {
  // add decimal values
  // 两个十进制的值相加
  addDecimalValues: function (value1, value2) {
    var result = value1 + value2;
    console.log(value1 + " + " + value2 + " = " + result + " (decimal)");

    return result;
  },

  // add hexadecimal values
  // 两个十六进制的值相加
  addHexadecimalValues: function (value1, value2) {
    var decimal1 = parseInt(value1, 16);
    var decimal2 = parseInt(value2, 16);

    var result = (decimal1 + decimal2).toString(16);
    console.log(value1 + " + " + value2 + " = " + result + " (hex)");

    return result;
  },
};

const getCompletion = async (messages) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    // 重点：这里定义了 ChatCompletion 可以使用的函数
    // important: define the functions that can be used by the ChatCompletion
    functions: [
      {
        name: "addDecimalValues",
        description: "Add two decimal values",
        parameters: {
          type: "object",
          properties: {
            value1: {
              type: "integer",
              description: "The first decimal value to add. For example, 5",
            },
            value2: {
              type: "integer",
              description: "The second decimal value to add. For example, 10",
            },
          },
          required: ["value1", "value2"],
        },
      },
      {
        name: "addHexadecimalValues",
        description: "Add two hexadecimal values",
        parameters: {
          type: "object",
          properties: {
            value1: {
              type: "string",
              description: "The first hexadecimal value to add. For example, 5",
            },
            value2: {
              type: "string",
              description:
                "The second hexadecimal value to add. For example, A",
            },
          },
          required: ["value1", "value2"],
        },
      },
    ],
    temperature: 0,
  });

  return response;
};

let response;
while (true) {
  response = await getCompletion(messages);

  // the output:
  // finish_reason: function_call
  // 
  // message: {
  //   role: 'assistant',
  //   content: null,
  //   function_call: {
  //     name: 'addDecimalValues',
  //     arguments: '{\n  "value1": 22,\n  "value2": 5\n}'
  //   }
  // }

  if (response.data.choices[0].finish_reason === "stop") {
    console.log(response.data.choices[0].message.content);
    break;
  } else if (response.data.choices[0].finish_reason === "function_call") {
    // get the function name and arguments from the response
    // 从响应中获取函数名和参数
    const fnName = response.data.choices[0].message.function_call.name;
    const args = response.data.choices[0].message.function_call.arguments;

    // call the function
    // 调用函数
    const functionToCall = functions[fnName];
    const { value1, value2 } = JSON.parse(args);
    const result = functionToCall(value1, value2);

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
