# OpenAI Function Calling Nodejs Example

## Introduction
This is a simple example of using OpenAI's API to call a function in Nodejs. The function is a simple calculator that takes two numbers and an operator and returns the result. The function is called using the OpenAI API and the result is returned to the user.

## Installation

```bash
npm i
```

## Usage
there are 3 scripts to play with Function Calling API. You can run them with the following commands:

```bash
# calculator
npm start

# getCurrentTime
# 1. get the time
npm run getCurrentTime

# timeToSport: 
# 1. get the time
# 2. choose a sport according to the time
npm run timeToSport
```

## Output

```bash
❯ npm start

> openai-function-calling-nodejs@1.0.0 test
> node index.js

22 + 5 = 27 (decimal)
27 + A = 31 (hex)
The result of adding 22 and 5 in decimal, and then adding the hexadecimal number A, is 31.
```

## License
MIT